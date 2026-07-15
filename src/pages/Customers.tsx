import { CarOutlined, FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, InputRef, message, Row, Space, Table, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";

import DeleteButton from "../components/buttons/DeleteButton";
import EditButton from "../components/buttons/EditButton";
import CustomerCars from "../components/CustomerCars";
import CustomerForm from "../components/forms/CustomerForm";
import { getColumnSearchProps } from "../components/TableSearchProps";
import CustomersTour from "../components/tours/CustomerTour";
import { getDb } from "../modules/db/instance";
import { useDrawerWidth, useQuery } from "../modules/hooks";
import { useStore } from "../modules/state";
import { Customer } from "../types/database";


export default function Customers() {
    const drawerWidth = useDrawerWidth();
    const [open, setOpen] = useState(false);
    const { data: customers, loading, reload } = useQuery<Customer>(() => getDb().getCustomers())
    const { searchTarget, setSearchTarget } = useStore((state) => state)
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
                        getDb().deleteRow(cs.id, "customers").then(() => {
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
        <Table virtual scroll={{ y: "calc(100vh - 230px)" }} dataSource={customers} columns={columns as any} rowKey="id" loading={loading} />
        <CustomersTour />
    </>
};

