import { PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, InputRef, Row, Space, Table } from "antd";
import { useRef, useState } from "react";

import DeleteButton from "../components/buttons/DeleteButton";
import EditButton from "../components/buttons/EditButton";
import CarsForm from "../components/forms/CarsForm";
import { getColumnSearchProps } from "../components/TableSearchProps";
import { deleteRow } from "../modules/database";
import { useDatabaseStore } from "../modules/state";
import { Car } from "../types/database";


export default function Cars() {
    const [open, setOpen] = useState(false);
    const { cars, updateDatabaseData } = useDatabaseStore((state) => state)
    const [selectedCar, setSelectedCar] = useState<Car>();
    const searchInput = useRef<InputRef>(null);


    const columns = [
        {
            title: "Anno",
            dataIndex: "year",
            key: "year",
        },
        {
            title: "Targa",
            dataIndex: "number_plate",
            key: "number_plate",
            ...getColumnSearchProps("number_plate", "targa", searchInput)

        },
        {
            title: "Marca",
            dataIndex: "maker_name",
            key: "maker_name",
            ...getColumnSearchProps("maker_name", "marca", searchInput)

        },
        {
            title: "Modello",
            dataIndex: "model_name",
            key: "model_name",
            ...getColumnSearchProps("model_name", "modello", searchInput)
        },
        {
            title: "Azioni",
            dataIndex: "",
            key: "actions",
            render: (_: unknown, cr: Car) =>
                <Space>
                    <EditButton onClick={() => { showDrawer(); setSelectedCar(cr) }} />
                    <DeleteButton onConfirm={() => {
                        deleteRow(cr.id, "cars", () => {
                            updateDatabaseData(["cars", "estimates"]);
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
        setSelectedCar(undefined);
    };

    return <>
        <Row justify="end" align="middle" style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
                Crea Auto
            </Button>
        </Row>

        <Drawer
            title={`${selectedCar ? "Aggiorna" : "Crea Nuovo"} Auto`}
            closable={{ 'aria-label': 'Chiudi' }}
            onClose={onClose}
            open={open}
        >
            <CarsForm onSubmit={onClose} car={selectedCar} />
        </Drawer>
        <Table dataSource={cars} columns={columns} rowKey="id" />
    </>
};

