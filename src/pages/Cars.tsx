import { FileTextOutlined, HistoryOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, InputRef, message, Row, Space, Table, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";

import DeleteButton from "../components/buttons/DeleteButton";
import EditButton from "../components/buttons/EditButton";
import CarHistory from "../components/CarHistory";
import CarsForm from "../components/forms/CarsForm";
import { getColumnSearchProps } from "../components/TableSearchProps";
import { getDb } from "../modules/db/instance";
import { useQuery } from "../modules/hooks";
import { useStore } from "../modules/state";
import { getLogoUrl } from "../modules/utils";
import { Car } from "../types/database";


export default function Cars() {
    const [open, setOpen] = useState(false);
    const { data: cars, loading, reload } = useQuery<Car>(() => getDb().getCars())
    const { searchTarget, setSearchTarget } = useStore((state) => state)
    const [selectedCar, setSelectedCar] = useState<Car>();
    const [historyCar, setHistoryCar] = useState<Car>();
    const searchInput = useRef<InputRef>(null);

    useEffect(() => {
        if (searchTarget?.table !== "cars" || !cars.length) return;
        const target = cars.find((c) => c.id === searchTarget.id);
        setSearchTarget(undefined);
        if (target) {
            setSelectedCar(target);
            setOpen(true);
        }
    }, [searchTarget, cars]);


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
            ...getColumnSearchProps("number_plate", "targa", searchInput),
            render: (plate: string, cr: Car) => (
                <Space>
                    <span>{plate}</span>
                    {cr.notes && (
                        <Tooltip title={cr.notes}>
                            <FileTextOutlined style={{ color: "#1677ff" }} />
                        </Tooltip>
                    )}
                </Space>
            )
        },
        {
            title: "Marca",
            dataIndex: "maker_name",
            key: "maker_name",
            ...getColumnSearchProps("maker_name", "marca", searchInput),
            render: (maker_name: string) => (
                <Space>
                    <img
                        src={getLogoUrl(maker_name)}
                        alt={maker_name}
                        title={maker_name}
                        style={{ height: 28, maxWidth: 60, objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createElement('span'), { textContent: maker_name })) }}
                    />
                </Space>
            )
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
                    <Tooltip title="Storico interventi">
                        <Button icon={<HistoryOutlined />} onClick={() => setHistoryCar(cr)} />
                    </Tooltip>
                    <DeleteButton onConfirm={() => {
                        getDb().deleteRow(cr.id, "cars").then(() => {
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
            <CarsForm onSubmit={() => { onClose(); reload(); }} car={selectedCar} />
        </Drawer>
        <Drawer
            title={`Storico interventi — ${historyCar?.number_plate ?? ""}`}
            closable={{ 'aria-label': 'Chiudi' }}
            onClose={() => setHistoryCar(undefined)}
            open={!!historyCar}
            width={480}
        >
            {historyCar && <CarHistory car={historyCar} />}
        </Drawer>
        <Table virtual scroll={{ y: "calc(100vh - 230px)" }} dataSource={cars} columns={columns as any} rowKey="id" loading={loading} />
    </>
};

