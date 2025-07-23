import { PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, Row, Space, Table } from "antd";
import { useEffect, useState } from "react";
import DeleteButton from "../components/buttons/DeleteButton";
import EditButton from "../components/buttons/EditButton";
import WorkshopForm from "../components/forms/WorkshopForm";
import { deleteRow } from "../modules/database";
import { useDatabaseStore, useStore } from "../modules/state";
import { Workshop } from "../types/database";


export default function Workshops() {
    const [open, setOpen] = useState(false);
    const { workshops, updateDatabaseData } = useDatabaseStore((state) => state)

    const { settings, updateSettings } = useStore((state) => state);
    const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop>();

    useEffect(() => {
        if (workshops) {
            updateSettings({ selectedWorkshop: workshops.find(ws => ws.id == settings.selectedWorkshop?.id) })
        }
    }, [workshops])

    const columns = [
        {
            title: "Nome",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Indirizzo",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Iva N.",
            dataIndex: "vat_number",
            key: "vat_number",
        },
        {
            title: "Telefono",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Prezzo Mano d'Opera",
            dataIndex: "base_labor_cost",
            key: "base_labor_cost",
            render: (cost: number) => `€ ${cost.toFixed(2)}`,
        },
        {
            title: "Azioni",
            dataIndex: "",
            key: "actions",
            render: (_: unknown, ws: Workshop) => {
                const isSelected = settings.selectedWorkshop?.id === ws.id;
                return <Space>
                    <Button onClick={() => { updateSettings({ selectedWorkshop: ws }) }} type={"primary"} disabled={isSelected}>Seleziona</Button>
                    <EditButton onClick={() => { showDrawer(); setSelectedWorkshop(ws) }} />
                    <DeleteButton onConfirm={() => {
                        deleteRow(ws.id, "workshops", () => {
                            updateDatabaseData(["workshops", "cars", "customers", "appointments", "estimates"]);
                        })
                    }} disabled={isSelected || workshops.length < 2} />
                </Space >
            },
        },
    ]
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        setSelectedWorkshop(undefined);
    };

    return <>
        <Row justify="end" align="middle" style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
                Crea Officina
            </Button>
        </Row>

        <Drawer
            title={`${selectedWorkshop ? "Aggiorna" : "Crea Nuova"} Officina`}
            closable={{ 'aria-label': 'Chiudi' }}
            onClose={onClose}
            open={open}
        >
            <WorkshopForm onSubmit={onClose} workshop={selectedWorkshop} />
        </Drawer>
        <Table dataSource={workshops} columns={columns} rowKey="id" />
    </>
};

