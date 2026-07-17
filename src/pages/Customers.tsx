import { CarOutlined, FileTextOutlined, PhoneOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, InputRef, List, message, Row, Space, Spin, Table, Tooltip, Typography } from "antd";
import { useEffect, useRef, useState } from "react";

import DeleteButton from "../components/buttons/DeleteButton";
import EditButton from "../components/buttons/EditButton";
import CustomerCars from "../components/CustomerCars";
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
    const [carsCustomer, setCarsCustomer] = useState<Customer>();
    const searchInput = useRef<InputRef>(null);

    useEffect(() => {
        if (searchTarget?.table !== "customers" || !customers.length) return;
        const target = customers.find((c) => c.id === searchTarget.id);
        setSearchTarget(undefined);
        if (target) {
            setSelectedCustomer(target);
            setOpen(true);
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
            title: "Azioni",
            dataIndex: "",
            key: "actions",
            render: (_: unknown, cs: Customer) =>
                <Space>
                    <EditButton onClick={() => { showDrawer(); setSelectedCustomer(cs) }} />
                    <Tooltip title="Auto del cliente">
                        <Button icon={<CarOutlined />} onClick={() => setCarsCustomer(cs)} />
                    </Tooltip>
                    <DeleteButton onConfirm={() => {
                        api.deleteCustomer(cs.id).then(() => {
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
                                <Space>
                                    {cs.phone && (
                                        <Tooltip title="Chiama">
                                            <Button type="primary" icon={<PhoneOutlined />} href={`tel:${cs.phone}`} />
                                        </Tooltip>
                                    )}
                                    <EditButton onClick={() => { showDrawer(); setSelectedCustomer(cs) }} />
                                    <Tooltip title="Auto del cliente">
                                        <Button icon={<CarOutlined />} onClick={() => setCarsCustomer(cs)} />
                                    </Tooltip>
                                    <DeleteButton onConfirm={() => {
                                        api.deleteCustomer(cs.id).then(() => {
                                            message.success("Eliminato con successo!");
                                            reload();
                                        }).catch((e) => message.error("Errore nell'eliminazione: " + e))
                                    }} />
                                </Space>
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

