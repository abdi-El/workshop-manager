import { PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, Popconfirm, Radio, Row, Space, Table } from "antd";
import { useState } from "react";

import EstimatesForm from "../components/forms/EstimatesForm";
import SaveEstimatePdf from "../components/pdf/SavePdfButton";
import { deleteRow } from "../modules/database";
import { useDatabaseStore } from "../modules/state";
import { Estimate } from "../types/database";


export default function Estimates() {
    const [open, setOpen] = useState(false);
    const { estimates, updateDatabaseData } = useDatabaseStore((state) => state)
    const [selectedEstimate, setSelectedEstimate] = useState<Estimate>();

    const columns = [
        {
            title: "Data",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Cliente",
            dataIndex: "customer_name",
            key: "customer_name",
        },
        {
            title: "Targa",
            dataIndex: "car_number_plate",
            key: "car_number_plate",
        },
        {
            title: "Auto",
            dataIndex: "car_id",
            key: "car_id",
        },
        {
            title: "Ore Lavoro",
            dataIndex: "labor_hours",
            key: "labor_hours",
        },
        {
            title: "Costo Orario",
            dataIndex: "labor_hourly_cost",
            key: "labor_hourly_cost",
            render: (cost: number) => `€ ${cost}`,
        },
        {
            title: "Sconto",
            dataIndex: "discount",
            key: "discount",
            render: (discount: number | null) => discount ? `€ ${discount}` : 'N/A',
        },
        {
            title: "IVA",
            dataIndex: "has_iva",
            key: "has_iva",
            render: (hasIva: boolean) => hasIva ? 'Sì' : 'No',
        },
        {
            title: "Azioni",
            dataIndex: "",
            key: "actions",
            render: (_: unknown, es: Estimate) =>
                <Space>
                    <Radio.Group buttonStyle="solid">
                        <Radio.Button onClick={() => { showDrawer(); setSelectedEstimate(es) }}>Modifica</Radio.Button>
                        <Popconfirm
                            title="Elimina Preventivo"
                            description="Sei sicuro di voler eliminare questo preventivo?"
                            okText="Sì"
                            cancelText="No"
                            onConfirm={() => {
                                deleteRow(es.id, "estimates", () => {
                                    updateDatabaseData(["estimates"]);
                                })
                            }}
                        >
                            <Radio.Button>Elimina</Radio.Button>
                        </Popconfirm>
                    </Radio.Group>
                    <SaveEstimatePdf estimateId={es.id} />
                </Space >,
        },
    ]
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        setSelectedEstimate(undefined);
    };

    return <>
        <Row justify="end" align="middle" style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
                Crea Preventivo
            </Button>
        </Row>

        <Drawer
            title={`${selectedEstimate ? "Aggiorna" : "Crea Nuovo"} Preventivo`}
            closable={{ 'aria-label': 'Chiudi' }}
            onClose={onClose}
            open={open}
            width={"75%"}
        >
            <EstimatesForm onSubmit={onClose} estimate={selectedEstimate} />
        </Drawer>
        <Table dataSource={estimates} columns={columns} rowKey="id" />;
    </>
};

