import { PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, InputRef, Popconfirm, Radio, Row, Space, Table } from "antd";
import { useRef, useState } from "react";

import CustomerForm from "../components/forms/CustomerForm";
import { getColumnSearchProps } from "../components/TableSearchProps";
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
                    <Radio.Group buttonStyle="solid">
                        <Radio.Button onClick={() => { showDrawer(); setSelectedCustomer(cs) }}>Modifica</Radio.Button>
                        <Popconfirm
                            title="Elimina Officina"
                            description="Sei sicuro di voler eliminare questa officina?"
                            okText="Sì"
                            cancelText="No"
                            onConfirm={() => {
                                deleteRow(cs.id, "customers", () => {
                                    updateDatabaseData(["customers"]);
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
        setSelectedCustomer(undefined);
    };

    return <>
        <Row justify="end" align="middle" style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
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
        <Table dataSource={customers} columns={columns} rowKey="id" />
    </>
};

