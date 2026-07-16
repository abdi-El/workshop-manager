import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, InputRef, List, message, Popover, Row, Space, Spin, Table, Typography } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";

import DeleteButton from "../components/buttons/DeleteButton";
import EditButton from "../components/buttons/EditButton";
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
    const { data: estimateRows, loading, reload } = useQuery<Estimate>(() => api.getEstimates())
    const estimates = useMemo(() => {
        return estimateRows.map((r) => ({ ...r, has_iva: (r.has_iva as any) == "true" }))
    }, [estimateRows])
    const { searchTarget, setSearchTarget } = useStore((state) => state)
    const [selectedEstimate, setSelectedEstimate] = useState<Estimate>();
    const searchInput = useRef<InputRef>(null);

    useEffect(() => {
        if (searchTarget?.table !== "estimates" || !estimates.length) return;
        const target = estimates.find((e) => e.id === searchTarget.id);
        setSearchTarget(undefined);
        if (target) {
            setSelectedEstimate(target);
            setOpen(true);
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
            width: 70,
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
            width: 180,
            render: (_: unknown, es: Estimate) =>
                <Space size={4}>
                    <EditButton onClick={() => { showDrawer(); setSelectedEstimate(es) }} />
                    <SaveEstimatePdf estimateId={es.id} />
                    <Popover
                        title={!es.appointment_id ? "Crea appuntamento" : `Appuntamento già creato`}
                        content={!es.appointment_id && <AppointmentForm estimateId={es.id} onSubmit={reload} />}
                    >
                        <Button icon={<CalendarOutlined />} type={!!es.appointment_id ? "primary" : "dashed"} size="small" />
                    </Popover>
                    <DeleteButton onConfirm={() => {
                        api.deleteEstimate(es.id).then(() => {
                            message.success("Eliminato con successo!");
                            reload();
                        }).catch((e) => message.error("Errore nell'eliminazione: " + e))
                    }} />
                </Space >,
        },
    ]
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        setSelectedEstimate(undefined);
    };

    return <>
        <Row justify="end" align="middle" style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
                Crea Lavoro
            </Button>
        </Row>
        <Drawer
            title={`${selectedEstimate ? "Aggiorna" : "Crea Nuovo"} Lavoro`}
            closable={{ 'aria-label': 'Chiudi' }}
            onClose={onClose}
            open={open}
            width={drawerWidth}
        >
            <EstimatesForm onSubmit={() => { onClose(); reload(); }} estimate={selectedEstimate} />
        </Drawer>
        {isMobile ? (
            loading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> :
            <List
                dataSource={estimates}
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
                            <Space size={4}>
                                <EditButton onClick={() => { showDrawer(); setSelectedEstimate(es) }} />
                                <SaveEstimatePdf estimateId={es.id} />
                                <Popover
                                    title={!es.appointment_id ? "Crea appuntamento" : "Appuntamento già creato"}
                                    content={!es.appointment_id && <AppointmentForm estimateId={es.id} onSubmit={reload} />}
                                >
                                    <Button icon={<CalendarOutlined />} type={!!es.appointment_id ? "primary" : "dashed"} size="small" />
                                </Popover>
                                <DeleteButton onConfirm={() => {
                                    api.deleteEstimate(es.id).then(() => {
                                        message.success("Eliminato con successo!");
                                        reload();
                                    }).catch((e) => message.error("Errore nell'eliminazione: " + e))
                                }} />
                            </Space>
                        </Row>
                    </Card>
                )}
            />
        ) : (
            <Table virtual scroll={{ y: "calc(100vh - 230px)" }} dataSource={estimates} columns={columns as any} rowKey="id" loading={loading} />
        )}
    </>
};

