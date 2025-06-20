import { PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, Popconfirm, Radio, Row, Space, Table } from "antd";
import { useState } from "react";
import WorkshopForm from "../components/forms/WorkshopForm";
import { deleteRow } from "../database";
import { useStore } from "../state";
import { Workshop } from "../types/database";


export default function Workshops() {
    const [open, setOpen] = useState(false);
    const { workshops, updateDatabaseData } = useStore((state) => state);
    const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop>();

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
            render: (_: unknown, ws: Workshop) =>
                <Space>
                    <Radio.Group value={""} buttonStyle="solid">
                        <Radio.Button onClick={() => { showDrawer(); setSelectedWorkshop(ws) }}>Modifica</Radio.Button>
                        <Popconfirm
                            title="Elimina Officina"
                            description="Sei sicuro di voler eliminare questa officina?"
                            okText="Sì"
                            cancelText="No"
                            onConfirm={() => {
                                deleteRow(ws.id, "workshops", () => {
                                    updateDatabaseData("workshops");
                                })
                            }}
                        >
                            <Radio.Button>Elimina</Radio.Button>
                        </Popconfirm>
                    </Radio.Group>
                </Space >,
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
        <Table dataSource={workshops} columns={columns} rowKey="id" />;
    </>
};

