import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, List, message, Row, Space, Spin, Table, Typography } from "antd";
import { useState } from "react";
import DeleteButton from "../components/buttons/DeleteButton";
import EditButton from "../components/buttons/EditButton";
import WorkshopForm from "../components/forms/WorkshopForm";
import WorkshopTour from "../components/tours/WorkshopTour";
import { api } from "../modules/api";
import { useDrawerWidth, useIsMobile, useQuery } from "../modules/hooks";
import { useStore } from "../modules/state";
import { Workshop } from "../types/database";


export default function Workshops() {
    const drawerWidth = useDrawerWidth();
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const { data: workshops, loading, reload } = useQuery<Workshop>(() => api.getWorkshops())
    const { updateSettings, settings } = useStore((state) => state);
    const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop>();

    const showDrawer = () => setOpen(true);
    const onClose = () => {
        setOpen(false);
        setSelectedWorkshop(undefined);
    };

    function onFormSubmit() {
        onClose();
        reload();
        api.getWorkshops().then((ws) => {
            const current = settings.selectedWorkshop;
            if (current) {
                const updated = ws.find((w) => w.id === current.id);
                if (updated) updateSettings({ selectedWorkshop: updated });
            } else if (ws.length) {
                updateSettings({ selectedWorkshop: ws[0] });
            }
        });
    }

    const columns = [
        { title: "Nome", dataIndex: "name", key: "name" },
        { title: "Indirizzo", dataIndex: "address", key: "address" },
        { title: "P.IVA", dataIndex: "vat_number", key: "vat_number" },
        { title: "Telefono", dataIndex: "phone", key: "phone" },
        { title: "Email", dataIndex: "email", key: "email" },
        {
            title: "€/Ora", dataIndex: "base_labor_cost", key: "base_labor_cost",
            render: (v: number) => `€ ${v}`
        },
        {
            title: "Azioni", key: "actions",
            render: (_: unknown, ws: Workshop) => (
                <Space>
                    <EditButton onClick={() => { showDrawer(); setSelectedWorkshop(ws) }} />
                    {settings.selectedWorkshop?.id !== ws.id && (
                        <DeleteButton onConfirm={() => {
                            api.deleteWorkshop(ws.id).then(() => {
                                message.success("Eliminato con successo!");
                                reload();
                            }).catch((e) => message.error("Errore: " + e))
                        }} />
                    )}
                </Space>
            )
        },
    ];

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
            width={drawerWidth}
        >
            <WorkshopForm onSubmit={onFormSubmit} workshop={selectedWorkshop} />
        </Drawer>

        {isMobile ? (
            loading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> :
            <List
                dataSource={workshops}
                rowKey="id"
                renderItem={(ws) => (
                    <Card
                        size="small"
                        style={{
                            marginBottom: 8,
                            borderColor: settings.selectedWorkshop?.id === ws.id ? '#1677ff' : undefined,
                        }}
                        title={<span>{ws.name}</span>}
                        extra={
                            settings.selectedWorkshop?.id === ws.id
                                ? <Typography.Text type="success">Attiva</Typography.Text>
                                : <Button size="small" onClick={() => updateSettings({ selectedWorkshop: ws })}>Seleziona</Button>
                        }
                    >
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                            {ws.address && <Typography.Text type="secondary">{ws.address}</Typography.Text>}
                            {ws.phone && <span>{ws.phone}</span>}
                            {ws.email && <Typography.Text type="secondary">{ws.email}</Typography.Text>}
                            <Typography.Text>€ {ws.base_labor_cost}/ora</Typography.Text>
                            <Row justify="end">
                                <Space>
                                    <EditButton onClick={() => { showDrawer(); setSelectedWorkshop(ws) }} />
                                    {settings.selectedWorkshop?.id !== ws.id && (
                                        <DeleteButton onConfirm={() => {
                                            api.deleteWorkshop(ws.id).then(() => {
                                                message.success("Eliminato con successo!");
                                                reload();
                                            }).catch((e) => message.error("Errore: " + e))
                                        }} />
                                    )}
                                </Space>
                            </Row>
                        </Space>
                    </Card>
                )}
            />
        ) : (
            <Table dataSource={workshops} columns={columns as any} rowKey="id" loading={loading}
                rowClassName={(ws) => settings.selectedWorkshop?.id === ws.id ? 'ant-table-row-selected' : ''} />
        )}
        <WorkshopTour />
    </>;
}
