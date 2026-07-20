import { CalendarOutlined, CopyOutlined, DeleteOutlined, EditOutlined, EyeOutlined, FilePdfOutlined, MoreOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Dropdown, Input, InputRef, List, message, Modal, Row, Space, Spin, Table, Typography } from "antd";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import DeleteButton from "../components/buttons/DeleteButton";
import EditButton from "../components/buttons/EditButton";
import EstimateDetail from "../components/detail/EstimateDetail";
import DetailModal from "../components/detail/DetailModal";
import AppointmentForm from "../components/forms/AppointmentForm";
import EstimatesForm from "../components/forms/EstimatesForm";
import { lazy } from "react";
const SaveEstimatePdf = lazy(() => import("../components/pdf/SavePdfButton"));
import { getColumnSearchProps } from "../components/TableSearchProps";
import { api } from "../modules/api";
import { sortBytDate } from "../modules/dates";
import { useDrawerWidth, useIsMobile, useQuery } from "../modules/hooks";
import { useStore } from "../modules/state";
import { getLogoUrl } from "../modules/utils";
import { Estimate } from "../types/database";

function estimateSorter(a: Estimate, b: Estimate, key: keyof Estimate) {
    return (a[key] as number) - (b[key] as number)
}


export default function Estimates() {
    const drawerWidth = useDrawerWidth("75%");
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const { settings, searchTarget, setSearchTarget } = useStore((state) => state)
    const workshopId = settings.selectedWorkshop?.id;
    const { data: estimateRows, loading, reload } = useQuery<Estimate>(() => api.getEstimates(workshopId), [workshopId])
    const estimates = useMemo(() => {
        return estimateRows.map((r) => ({ ...r, has_iva: (r.has_iva as any) == "true" }))
    }, [estimateRows])
    const [selectedEstimate, setSelectedEstimate] = useState<Estimate>();
    const [detailEstimate, setDetailEstimate] = useState<Estimate>();
    const [appointmentEstimateId, setAppointmentEstimateId] = useState<number>();
    const [duplicateItems, setDuplicateItems] = useState<import("../types/database").EstimateItem[]>();
    const [mobileSearch, setMobileSearch] = useState("");
    const searchInput = useRef<InputRef>(null);

    const filteredEstimates = useMemo(() => {
        if (!mobileSearch) return estimates;
        const q = mobileSearch.toLowerCase();
        return estimates.filter(e =>
            e.customer_name?.toLowerCase().includes(q) ||
            e.car_number_plate?.toLowerCase().includes(q) ||
            e.maker_name?.toLowerCase().includes(q) ||
            e.date?.toLowerCase().includes(q)
        );
    }, [estimates, mobileSearch]);

    useEffect(() => {
        if (searchTarget?.table !== "estimates" || !estimates.length) return;
        const target = estimates.find((e) => e.id === searchTarget.id);
        setSearchTarget(undefined);
        if (target) {
            if (searchTarget.action === "edit") {
                setSelectedEstimate(target);
                setOpen(true);
            } else {
                setDetailEstimate(target);
            }
        }
    }, [searchTarget, estimates]);

    const columns = [
        {
            title: "Data",
            dataIndex: "date",
            key: "date",
            width: 110,
            sorter: (a: Estimate, b: Estimate) => sortBytDate(a.date, b.date)
        },
        {
            title: "Marca",
            dataIndex: "maker_name",
            key: "maker_name",
            width: 80,
            render: (maker: string) => maker ? (
                <img
                    src={getLogoUrl(maker)}
                    alt={maker}
                    title={maker}
                    style={{ height: 28, maxWidth: 60, objectFit: 'contain' }}
                    onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createElement('span'), { textContent: maker })) }}
                />
            ) : null
        },
        {
            title: "Cliente",
            dataIndex: "customer_name",
            key: "customer_name",
            ...getColumnSearchProps("customer_name", "cliente", searchInput)
        },
        {
            title: "Targa",
            dataIndex: "car_number_plate",
            key: "car_number_plate",
            width: 120,
            ...getColumnSearchProps("car_number_plate", "targa", searchInput)
        },
        {
            title: "Ore",
            dataIndex: "labor_hours",
            key: "labor_hours",
            width: 100,
            sorter: (a: Estimate, b: Estimate) => estimateSorter(a, b, "labor_hours"),
        },
        {
            title: "€/Ora",
            dataIndex: "labor_hourly_cost",
            key: "labor_hourly_cost",
            width: 80,
            render: (cost: number) => `€ ${cost}`,
        },
        {
            title: "Totale",
            dataIndex: "total",
            key: "total",
            width: 120,
            render: (total: number | undefined, es: Estimate) =>
                `€ ${(total ?? 0).toFixed(2)}${!es.has_iva ? ' + IVA' : ""}`,
            sorter: (a: Estimate, b: Estimate) => (a.total ?? 0) - (b.total ?? 0),
        },
        {
            title: "Azioni",
            dataIndex: "",
            key: "actions",
            width: 60,
            render: (_: unknown, es: Estimate) =>
                <Suspense fallback={<Button icon={<MoreOutlined />} />}>
                    <SaveEstimatePdf estimateId={es.id}>
                        {({ save, preview }) => (
                            <Dropdown menu={{
                                items: [
                                    { key: 'detail', label: 'Dettaglio', icon: <EyeOutlined /> },
                                    { key: 'edit', label: 'Modifica', icon: <EditOutlined /> },
                                    { key: 'duplicate', label: 'Duplica', icon: <CopyOutlined /> },
                                    { key: 'preview', label: 'Anteprima PDF', icon: <FilePdfOutlined /> },
                                    { key: 'save', label: 'Salva PDF', icon: <SaveOutlined /> },
                                    es.appointment_id
                                        ? { key: 'appointment', label: 'Appuntamento creato', icon: <CalendarOutlined />, disabled: true }
                                        : { key: 'appointment', label: 'Crea appuntamento', icon: <CalendarOutlined /> },
                                    { type: 'divider' as const },
                                    { key: 'delete', label: 'Elimina', icon: <DeleteOutlined />, danger: true },
                                ],
                                onClick: ({ key }) => {
                                    if (key === 'detail') setDetailEstimate(es);
                                    else if (key === 'edit') { showDrawer(); setSelectedEstimate(es); }
                                    else if (key === 'duplicate') duplicateEstimate(es);
                                    else if (key === 'preview') preview();
                                    else if (key === 'save') save();
                                    else if (key === 'appointment') setAppointmentEstimateId(es.id);
                                    else if (key === 'delete') Modal.confirm({
                                        title: 'Conferma eliminazione',
                                        content: 'Sei sicuro di voler eliminare questo lavoro?',
                                        okText: 'Elimina',
                                        okType: 'danger',
                                        cancelText: 'Annulla',
                                        onOk: () => api.deleteEstimate(es.id).then(() => {
                                            message.success("Eliminato con successo!");
                                            reload();
                                        }).catch((e) => message.error("Errore nell'eliminazione: " + e))
                                    });
                                }
                            }}>
                                <Button icon={<MoreOutlined />} />
                            </Dropdown>
                        )}
                    </SaveEstimatePdf>
                </Suspense>,
        },
    ]
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        setSelectedEstimate(undefined);
        setDuplicateItems(undefined);
    };

    const duplicateEstimate = (es: Estimate) => {
        api.getEstimateItems(es.id).then((items) => {
            const { id, total, customer_name, car_number_plate, maker_name, workshop_name, appointment_id, ...rest } = es as any;
            setSelectedEstimate(rest);
            setDuplicateItems(items);
            setOpen(true);
        }).catch((e) => message.error("Errore nel duplicare: " + e));
    };

    return <>
        <Row justify="end" align="middle" style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
                Crea Lavoro
            </Button>
        </Row>
        <Drawer
            title={`${duplicateItems ? "Duplica" : selectedEstimate ? "Aggiorna" : "Crea Nuovo"} Lavoro`}
            closable={{ 'aria-label': 'Chiudi' }}
            onClose={onClose}
            open={open}
            width={drawerWidth}
        >
            <EstimatesForm onSubmit={() => { onClose(); reload(); }} estimate={selectedEstimate} initialItems={duplicateItems} />
        </Drawer>
        <DetailModal
            open={!!detailEstimate}
            onClose={() => setDetailEstimate(undefined)}
            title={detailEstimate ? `Lavoro — ${detailEstimate.customer_name ?? ""} ${detailEstimate.car_number_plate ?? ""}` : ""}
            footer={detailEstimate && <Space size={4}>
                <EditButton onClick={() => { setDetailEstimate(undefined); setSelectedEstimate(detailEstimate); setOpen(true); }} />
                <SaveEstimatePdf estimateId={detailEstimate.id} />
                <Button
                    icon={<CalendarOutlined />}
                    type={detailEstimate.appointment_id ? "primary" : "dashed"}
                    size="small"
                    disabled={!!detailEstimate.appointment_id}
                    onClick={() => { setDetailEstimate(undefined); setAppointmentEstimateId(detailEstimate.id); }}
                />
                <DeleteButton onConfirm={() => {
                    api.deleteEstimate(detailEstimate.id).then(() => {
                        message.success("Eliminato con successo!");
                        setDetailEstimate(undefined);
                        reload();
                    }).catch((e) => message.error("Errore nell'eliminazione: " + e))
                }} />
            </Space>}
        >
            {detailEstimate && <EstimateDetail estimate={detailEstimate} />}
        </DetailModal>
        <Modal
            open={!!appointmentEstimateId}
            onCancel={() => setAppointmentEstimateId(undefined)}
            footer={null}
            title="Crea appuntamento"
        >
            {appointmentEstimateId && <AppointmentForm estimateId={appointmentEstimateId} onSubmit={() => { setAppointmentEstimateId(undefined); reload(); }} />}
        </Modal>
        {isMobile ? (
            loading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> :
            <>
            <Input.Search
                placeholder="Cerca lavoro..."
                allowClear
                onChange={(e) => setMobileSearch(e.target.value)}
                style={{ marginBottom: 12 }}
            />
            <List
                dataSource={filteredEstimates}
                rowKey="id"
                renderItem={(es) => (
                    <Card
                        size="small"
                        style={{ marginBottom: 8 }}
                        title={
                            <Space>
                                {es.maker_name && <img
                                    src={getLogoUrl(es.maker_name)}
                                    alt={es.maker_name}
                                    style={{ height: 20, maxWidth: 40, objectFit: 'contain' }}
                                    onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createElement('span'), { textContent: es.maker_name })) }}
                                />}
                                <span>{es.customer_name}</span>
                            </Space>
                        }
                        extra={
                            <Typography.Text strong>
                                € {(es.total ?? 0).toFixed(2)}{!es.has_iva ? ' + IVA' : ''}
                            </Typography.Text>
                        }
                    >
                        <Row justify="space-between" align="middle">
                            <Space direction="vertical" size={0}>
                                <Typography.Text type="secondary">{es.date}</Typography.Text>
                                <span>{es.car_number_plate}</span>
                            </Space>
                            <Suspense fallback={<Button icon={<MoreOutlined />} />}>
                                <SaveEstimatePdf estimateId={es.id}>
                                    {({ save, preview }) => (
                                        <Dropdown menu={{
                                            items: [
                                                { key: 'detail', label: 'Dettaglio', icon: <EyeOutlined /> },
                                                { key: 'edit', label: 'Modifica', icon: <EditOutlined /> },
                                                { key: 'duplicate', label: 'Duplica', icon: <CopyOutlined /> },
                                                { key: 'preview', label: 'Anteprima PDF', icon: <FilePdfOutlined /> },
                                                { key: 'save', label: 'Salva PDF', icon: <SaveOutlined /> },
                                                es.appointment_id
                                                    ? { key: 'appointment', label: 'Appuntamento creato', icon: <CalendarOutlined />, disabled: true }
                                                    : { key: 'appointment', label: 'Crea appuntamento', icon: <CalendarOutlined /> },
                                                { type: 'divider' as const },
                                                { key: 'delete', label: 'Elimina', icon: <DeleteOutlined />, danger: true },
                                            ],
                                            onClick: ({ key }) => {
                                                if (key === 'detail') setDetailEstimate(es);
                                                else if (key === 'edit') { showDrawer(); setSelectedEstimate(es); }
                                                else if (key === 'duplicate') duplicateEstimate(es);
                                                else if (key === 'preview') preview();
                                                else if (key === 'save') save();
                                                else if (key === 'appointment') setAppointmentEstimateId(es.id);
                                                else if (key === 'delete') Modal.confirm({
                                                    title: 'Conferma eliminazione',
                                                    content: 'Sei sicuro di voler eliminare questo lavoro?',
                                                    okText: 'Elimina',
                                                    okType: 'danger',
                                                    cancelText: 'Annulla',
                                                    onOk: () => api.deleteEstimate(es.id).then(() => {
                                                        message.success("Eliminato con successo!");
                                                        reload();
                                                    }).catch((e) => message.error("Errore nell'eliminazione: " + e))
                                                });
                                            }
                                        }}>
                                            <Button icon={<MoreOutlined />} />
                                        </Dropdown>
                                    )}
                                </SaveEstimatePdf>
                            </Suspense>
                        </Row>
                    </Card>
                )}
            />
            </>
        ) : (
            <Table virtual scroll={{ y: "calc(100vh - 230px)" }} dataSource={estimates} columns={columns as any} rowKey="id" loading={loading} />
        )}
    </>
};

