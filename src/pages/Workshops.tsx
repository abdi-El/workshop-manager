import { Button, Drawer, Table } from "antd";
import { useState } from "react";
import WorkshopForm from "../components/forms/WorkshopForm";





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
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };
    return <>
        <Button type="primary" onClick={showDrawer}>
            Crea Officina
        </Button>
        <Drawer
            title="Crea Nuova Officina"
            closable={{ 'aria-label': 'Chiudi' }}
            onClose={onClose}
            open={open}
        >
            <WorkshopForm onSubmit={() => { }} />
        </Drawer>
        <Table dataSource={[]} columns={columns} rowKey="id" />;
    </>
};

