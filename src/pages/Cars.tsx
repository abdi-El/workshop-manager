import { PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, Popconfirm, Radio, Row, Space, Table } from "antd";
import { useState } from "react";

import CarsForm from "../components/forms/CarsForm";
import { deleteRow } from "../modules/database";
import { useDatabaseStore } from "../modules/state";
import { Car } from "../types/database";


export default function Cars() {
    const [open, setOpen] = useState(false);
    const { cars, updateDatabaseData } = useDatabaseStore((state) => state)
    const [selectedCar, setSelectedCar] = useState<Car>();

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
        },

        {
            title: "Azioni",
            dataIndex: "",
            key: "actions",
            render: (_: unknown, cr: Car) =>
                <Space>
                    <Radio.Group buttonStyle="solid">
                        <Radio.Button onClick={() => { showDrawer(); setSelectedCar(cr) }}>Modifica</Radio.Button>
                        <Popconfirm
                            title="Elimina Officina"
                            description="Sei sicuro di voler eliminare questa officina?"
                            okText="Sì"
                            cancelText="No"
                            onConfirm={() => {
                                deleteRow(cr.id, "cars", () => {
                                    updateDatabaseData(["cars"]);
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
        <Table dataSource={cars} columns={columns} rowKey="id" />;
    </>
};

