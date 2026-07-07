import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, InputRef, Popover, Row, Skeleton, Space, Table } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";

import DeleteButton from "../components/buttons/DeleteButton";
import EditButton from "../components/buttons/EditButton";
import AppointmentForm from "../components/forms/AppointmentForm";
import EstimatesForm from "../components/forms/EstimatesForm";
import { lazy } from "react";
const SaveEstimatePdf = lazy(() => import("../components/pdf/SavePdfButton"));
import { getColumnSearchProps } from "../components/TableSearchProps";
import { deleteRow } from "../modules/database";
import { sortBytDate } from "../modules/dates";
import { useDbQuery } from "../modules/hooks";
import { estimatesQuery } from "../modules/queries";
import { useStore } from "../modules/state";
import { getLogoUrl } from "../modules/utils";
import { Estimate } from "../types/database";

function estimateSorter(a: Estimate, b: Estimate, key: keyof Estimate) {
    return (a[key] as number) - (b[key] as number)
}


export default function Estimates() {
    const [open, setOpen] = useState(false);
    const { data: estimateRows, loading, reload } = useDbQuery<Estimate>(estimatesQuery)
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
            sorter: (a: Estimate, b: Estimate) => sortBytDate(a.date, b.date)
        },
        {
            title: "Marca",
            dataIndex: "maker_name",
            key: "maker_name",
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
            ...getColumnSearchProps("car_number_plate", "targa", searchInput)
        },
        {
            title: "Ore Lavoro",
            dataIndex: "labor_hours",
            key: "labor_hours",
            sorter: (a: Estimate, b: Estimate) => estimateSorter(a, b, "labor_hours"),

        },
        {
            title: "Costo Orario",
            dataIndex: "labor_hourly_cost",
            key: "labor_hourly_cost",
            render: (cost: number) => `€ ${cost}`,
        },
        {
            title: "Totale",
            dataIndex: "total",
            key: "total",
            render: (total: number | undefined, es: Estimate) =>
                `€ ${(total ?? 0).toFixed(2)}${!es.has_iva ? ' + IVA' : ""}`,
            sorter: (a: Estimate, b: Estimate) => (a.total ?? 0) - (b.total ?? 0),
        },
        {
            title: "Azioni",
            dataIndex: "",
            key: "actions",
            render: (_: unknown, es: Estimate) =>

                <Space>
                    <EditButton onClick={() => { showDrawer(); setSelectedEstimate(es) }} />
                    <SaveEstimatePdf estimateId={es.id} />
                    <Popover
                        title={!es.appointment_id ? "Crea appuntamento" : `Appuntamento già creato`}
                        content={!es.appointment_id && <AppointmentForm estimateId={es.id} onSubmit={reload} />}
                    >
                        <Button icon={<CalendarOutlined />} type={!!es.appointment_id ? "primary" : "dashed"} />
                    </Popover>
                    <DeleteButton onConfirm={() => {
                        deleteRow(es.id, "estimates", () => {
                            reload();
                        })
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
            width={"75%"}
        >
            <EstimatesForm onSubmit={() => { onClose(); reload(); }} estimate={selectedEstimate} />
        </Drawer>
        {loading && !estimates.length
            ? <Skeleton active paragraph={{ rows: 8 }} />
            : <Table virtual scroll={{ y: "calc(100vh - 230px)" }} dataSource={estimates} columns={columns as any} rowKey="id" loading={loading} />
        }
    </>
};

