import { PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, Row, Table } from "antd";
import { useState } from "react";
import WorkshopForm from "../components/forms/WorkshopForm";
import { useStore } from "../state";


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
];

export default function Workshops() {
    const [open, setOpen] = useState(false);
    const { workshops } = useStore((state) => state);

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    return <>
        <Row justify="end" align="middle" style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
                Crea Officina
            </Button>
        </Row>

        <Drawer
            title="Crea Nuova Officina"
            closable={{ 'aria-label': 'Chiudi' }}
            onClose={onClose}
            open={open}
        >
            <WorkshopForm onSubmit={onClose} />
        </Drawer>
        <Table dataSource={workshops} columns={columns} rowKey="id" />;
    </>
};

