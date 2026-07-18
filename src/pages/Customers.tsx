import { CarOutlined, DeleteOutlined, EditOutlined, EyeOutlined, FileTextOutlined, MoreOutlined, PhoneOutlined, PlusOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Dropdown, InputRef, List, message, Modal, Row, Space, Spin, Table, Tooltip, Typography } from "antd";
import { useEffect, useRef, useState } from "react";

import DeleteButton from "../components/buttons/DeleteButton";
import EditButton from "../components/buttons/EditButton";
import CustomerCars from "../components/CustomerCars";
import CustomerDetail from "../components/detail/CustomerDetail";
import DetailModal from "../components/detail/DetailModal";
import CustomerForm from "../components/forms/CustomerForm";
import { getColumnSearchProps } from "../components/TableSearchProps";
import { api } from "../modules/api";
import { useDrawerWidth, useIsMobile, useQuery } from "../modules/hooks";
import { useStore } from "../modules/state";
import { Customer } from "../types/database";


export default function Customers() {
    const drawerWidth = useDrawerWidth();
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const { settings, searchTarget, setSearchTarget } = useStore((state) => state)
    const workshopId = settings.selectedWorkshop?.id;
    const { data: customers, loading, reload } = useQuery<Customer>(() => api.getCustomers(workshopId), [workshopId])
    const [selectedCustomer, setSelectedCustomer] = useState<Customer>();
    const [detailCustomer, setDetailCustomer] = useState<Customer>();
    const [carsCustomer, setCarsCustomer] = useState<Customer>();
    const searchInput = useRef<InputRef>(null);

    useEffect(() => {
        if (searchTarget?.table !== "customers" || !customers.length) return;
        const target = customers.find((c) => c.id === searchTarget.id);
        setSearchTarget(undefined);
        if (target) {
            if (searchTarget.action === "edit") {
                setSelectedCustomer(target);
                setOpen(true);
            } else {
                setDetailCustomer(target);
            }
        }
    }, [searchTarget, customers]);


    const columns = [
        {
            title: "Nome Cliente",
            dataIndex: "name",
            key: "name",
            ...getColumnSearchProps("name", "nome", searchInput),
            render: (name: string, cs: Customer) => (
                <Space>
                    <span>{name}</span>
                    {cs.notes && (
                        <Tooltip title={cs.notes}>
                            <FileTextOutlined style={{ color: "#1677ff" }} />
                        </Tooltip>
                    )}
                </Space>
            )
        },
        {
            title: "Indirizzo",
            dataIndex: "address",
            key: "address",
            ...getColumnSearchProps("address", "indirizzo", searchInput)

        },
        {
            title: "Telefono",
            dataIndex: "phone",
            key: "phone",
            ...getColumnSearchProps("phone", "telefono", searchInput)
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            ...getColumnSearchProps("email", "email", searchInput)

        },
        {
            title: "Lavori",
            dataIndex: "estimate_count",
            key: "estimate_count",
            width: 80,
            sorter: (a: Customer, b: Customer) => (a.estimate_count ?? 0) - (b.estimate_count ?? 0),
        },
        {
            title: "Azioni",
            dataIndex: "",
            key: "actions",
            render: (_: unknown, cs: Customer) =>
                <Dropdown menu={{
                    items: [
                        { key: 'detail', label: 'Dettaglio', icon: <EyeOutlined /> },
                        { key: 'edit', label: 'Modifica', icon: <EditOutlined /> },
                        { key: 'cars', label: 'Auto del cliente', icon: <CarOutlined /> },
                        { type: 'divider' as const },
                        { key: 'delete', label: 'Elimina', icon: <DeleteOutlined />, danger: true },
                    ],
                    onClick: ({ key }) => {
                        if (key === 'detail') setDetailCustomer(cs);
                        else if (key === 'edit') { showDrawer(); setSelectedCustomer(cs); }
                        else if (key === 'cars') setCarsCustomer(cs);
                        else if (key === 'delete') Modal.confirm({
                            title: 'Conferma eliminazione',
                            content: 'Sei sicuro di voler eliminare questo cliente?',
                            okText: 'Elimina',
                            okType: 'danger',
                            cancelText: 'Annulla',
                            onOk: () => api.deleteCustomer(cs.id).then(() => {
                                message.success("Eliminato con successo!");
                                reload();
                            }).catch((e) => message.error("Errore nell'eliminazione: " + e))
                        });
                    }
                }}>
                    <Button icon={<MoreOutlined />} />
                </Dropdown>,
        },
    ]
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        setSelectedCustomer(undefined);
    };

    return <>
        <Row justify="end" align="middle" style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />} id="CreateNewCustomer">
                Crea Cliente
            </Button>
        </Row>

        <Drawer
            title={`${selectedCustomer ? "Aggiorna" : "Crea Nuovo"} Cliente`}
            closable={{ 'aria-label': 'Chiudi' }}
            onClose={onClose}
            open={open}
            width={drawerWidth}
        >
            <CustomerForm onSubmit={() => { onClose(); reload(); }} customer={selectedCustomer} />
        </Drawer>
        <Drawer
            title={`Auto di ${carsCustomer?.name ?? ""}`}
            closable={{ 'aria-label': 'Chiudi' }}
            onClose={() => setCarsCustomer(undefined)}
            open={!!carsCustomer}
            width={drawerWidth}
        >
            {carsCustomer && <CustomerCars customer={carsCustomer} />}
        </Drawer>
        <DetailModal
            open={!!detailCustomer}
            onClose={() => setDetailCustomer(undefined)}
            title={detailCustomer?.name ?? ""}
            footer={detailCustomer && <Space>
                <EditButton onClick={() => { setDetailCustomer(undefined); setSelectedCustomer(detailCustomer); setOpen(true); }} />
                <Tooltip title="Auto del cliente">
                    <Button icon={<CarOutlined />} onClick={() => { setDetailCustomer(undefined); setCarsCustomer(detailCustomer); }} />
                </Tooltip>
                <DeleteButton onConfirm={() => {
                    api.deleteCustomer(detailCustomer.id).then(() => {
                        message.success("Eliminato con successo!");
                        setDetailCustomer(undefined);
                        reload();
                    }).catch((e) => message.error("Errore nell'eliminazione: " + e))
                }} />
            </Space>}
        >
            {detailCustomer && <CustomerDetail customer={detailCustomer} />}
        </DetailModal>
        {isMobile ? (
            loading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> :
            <List
                dataSource={customers}
                rowKey="id"
                renderItem={(cs) => (
                    <Card
                        size="small"
                        style={{ marginBottom: 8 }}
                        title={
                            <Space>
                                <span>{cs.name}</span>
                                {cs.notes && (
                                    <Tooltip title={cs.notes}>
                                        <FileTextOutlined style={{ color: "#1677ff" }} />
                                    </Tooltip>
                                )}
                            </Space>
                        }
                    >
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                            {cs.address && <Typography.Text type="secondary">{cs.address}</Typography.Text>}
                            {cs.phone && <span>{cs.phone}</span>}
                            {cs.email && <Typography.Text type="secondary">{cs.email}</Typography.Text>}
                            <Row justify="end">
                                <Dropdown menu={{
                                    items: [
                                        { key: 'detail', label: 'Dettaglio', icon: <EyeOutlined /> },
                                        { key: 'edit', label: 'Modifica', icon: <EditOutlined /> },
                                        { key: 'cars', label: 'Auto del cliente', icon: <CarOutlined /> },
                                        ...(cs.phone ? [
                                            { key: 'call', label: 'Chiama', icon: <PhoneOutlined /> },
                                            { key: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppOutlined style={{ color: "#25D366" }} /> },
                                        ] : []),
                                        { type: 'divider' as const },
                                        { key: 'delete', label: 'Elimina', icon: <DeleteOutlined />, danger: true },
                                    ],
                                    onClick: ({ key }) => {
                                        if (key === 'detail') setDetailCustomer(cs);
                                        else if (key === 'edit') { showDrawer(); setSelectedCustomer(cs); }
                                        else if (key === 'cars') setCarsCustomer(cs);
                                        else if (key === 'call') window.open(`tel:${cs.phone}`);
                                        else if (key === 'whatsapp') { const d = cs.phone.replace(/\D/g, ""); window.open(`https://wa.me/${d.startsWith("39") ? d : `39${d}`}`); }
                                        else if (key === 'delete') Modal.confirm({
                                            title: 'Conferma eliminazione',
                                            content: 'Sei sicuro di voler eliminare questo cliente?',
                                            okText: 'Elimina',
                                            okType: 'danger',
                                            cancelText: 'Annulla',
                                            onOk: () => api.deleteCustomer(cs.id).then(() => {
                                                message.success("Eliminato con successo!");
                                                reload();
                                            }).catch((e) => message.error("Errore nell'eliminazione: " + e))
                                        });
                                    }
                                }}>
                                    <Button icon={<MoreOutlined />} />
                                </Dropdown>
                            </Row>
                        </Space>
                    </Card>
                )}
            />
        ) : (
            <Table virtual scroll={{ y: "calc(100vh - 230px)" }} dataSource={customers} columns={columns as any} rowKey="id" loading={loading} />
        )}
    </>
};

