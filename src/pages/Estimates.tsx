import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, InputRef, Modal, Popover, Row, Space, Table } from "antd";
import { useRef, useState } from "react";

import DeleteButton from "../components/buttons/DeleteButton";
import EditButton from "../components/buttons/EditButton";
import AppointmentForm from "../components/forms/AppointmentForm";
import EstimatesForm from "../components/forms/EstimatesForm";
import SaveEstimatePdf from "../components/pdf/SavePdfButton";
import { getColumnSearchProps } from "../components/TableSearchProps";
import { deleteRow } from "../modules/database";
import { sortBytDate } from "../modules/dates";
import { useDatabaseStore } from "../modules/state";
import { Estimate } from "../types/database";

function estimateSorter(a: Estimate, b: Estimate, key: keyof Estimate) {
    return (a[key] as number) - (b[key] as number)
}


export default function Estimates() {
    const [open, setOpen] = useState(false);
    const { estimates, updateDatabaseData } = useDatabaseStore((state) => state)
    const [selectedEstimate, setSelectedEstimate] = useState<Estimate>();
    const searchInput = useRef<InputRef>(null);

    const columns = [
        {
            title: "Data",
            dataIndex: "date",
            key: "date",
            sorter: (a: Estimate, b: Estimate) => sortBytDate(a.date, b.date)
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
            title: "Sconto",
            dataIndex: "discount",
            key: "discount",
            render: (discount: number | null) => discount ? `€ ${discount}` : 'N/A',
            sorter: (a: Estimate, b: Estimate) => estimateSorter(a, b, "discount"),
        },
        {
            title: "IVA",
            dataIndex: "has_iva",
            key: "has_iva",
            render: (hasIva: boolean) => hasIva ? 'Sì' : 'No',
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
                        content={!es.appointment_id && <AppointmentForm estimateId={es.id} />}
                    >
                        <Button icon={<CalendarOutlined />} type={!!es.appointment_id ? "primary" : "dashed"} />
                    </Popover>
                    <DeleteButton onConfirm={() => {
                        deleteRow(es.id, "estimates", () => {
                            updateDatabaseData(["estimates", "appointments"]);
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
                Crea Preventivo
            </Button>
        </Row>
        <Modal>

        </Modal>

        <Drawer
            title={`${selectedEstimate ? "Aggiorna" : "Crea Nuovo"} Preventivo`}
            closable={{ 'aria-label': 'Chiudi' }}
            onClose={onClose}
            open={open}
            width={"75%"}
        >
            <EstimatesForm onSubmit={onClose} estimate={selectedEstimate} />
        </Drawer>
        <Table dataSource={estimates} columns={columns as any} rowKey="id" />
    </>
};

