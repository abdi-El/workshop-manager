import { PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, InputRef, Row, Space, Table } from "antd";
import { useRef, useState } from "react";

import DeleteButton from "../components/buttons/DeleteButton";
import EditButton from "../components/buttons/EditButton";
import CustomerForm from "../components/forms/CustomerForm";
import { getColumnSearchProps } from "../components/TableSearchProps";
import CustomersTour from "../components/tours/CustomerTour";
import { deleteRow } from "../modules/database";
import { useDatabaseStore } from "../modules/state";
import { Customer } from "../types/database";


export default function Customers() {
    const [open, setOpen] = useState(false);
    const { customers, updateDatabaseData } = useDatabaseStore((state) => state)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer>();
    const searchInput = useRef<InputRef>(null);


    const columns = [
        {
            title: "Nome Cliente",
            dataIndex: "name",
            key: "name",
            ...getColumnSearchProps("name", "nome", searchInput)

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
                    <DeleteButton onConfirm={() => {
                        deleteRow(cs.id, "customers", () => {
                            updateDatabaseData(["customers", "cars", "estimates"]);
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
        >
            <CustomerForm onSubmit={onClose} customer={selectedCustomer} />
        </Drawer>
        <Table dataSource={customers} columns={columns as any} rowKey="id" />
        <CustomersTour />
    </>
};

