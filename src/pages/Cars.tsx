import { FileTextOutlined, HistoryOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, InputRef, List, message, Row, Space, Spin, Table, Tooltip, Typography } from "antd";
import { useEffect, useRef, useState } from "react";

import DeleteButton from "../components/buttons/DeleteButton";
import EditButton from "../components/buttons/EditButton";
import CarHistory from "../components/CarHistory";
import CarsForm from "../components/forms/CarsForm";
import { getColumnSearchProps } from "../components/TableSearchProps";
import { api } from "../modules/api";
import { useDrawerWidth, useIsMobile, useQuery } from "../modules/hooks";
import { useStore } from "../modules/state";
import { getLogoUrl } from "../modules/utils";
import { Car } from "../types/database";


export default function Cars() {
    const drawerWidth = useDrawerWidth();
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const { data: cars, loading, reload } = useQuery<Car>(() => api.getCars())
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
                        api.deleteCar(cr.id).then(() => {
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
            width={drawerWidth}
        >
            <CarsForm onSubmit={() => { onClose(); reload(); }} car={selectedCar} />
        </Drawer>
        <Drawer
            title={`Storico interventi — ${historyCar?.number_plate ?? ""}`}
            closable={{ 'aria-label': 'Chiudi' }}
            onClose={() => setHistoryCar(undefined)}
            open={!!historyCar}
            width={drawerWidth}
        >
            {historyCar && <CarHistory car={historyCar} />}
        </Drawer>
        {isMobile ? (
            loading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> :
            <List
                dataSource={cars}
                rowKey="id"
                renderItem={(cr) => (
                    <Card
                        size="small"
                        style={{ marginBottom: 8 }}
                        title={
                            <Space>
                                {cr.maker_name && <img
                                    src={getLogoUrl(cr.maker_name)}
                                    alt={cr.maker_name}
                                    style={{ height: 20, maxWidth: 40, objectFit: 'contain' }}
                                    onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createElement('span'), { textContent: cr.maker_name })) }}
                                />}
                                <span>{cr.number_plate}</span>
                                {cr.notes && (
                                    <Tooltip title={cr.notes}>
                                        <FileTextOutlined style={{ color: "#1677ff" }} />
                                    </Tooltip>
                                )}
                            </Space>
                        }
                        extra={<Typography.Text type="secondary">{cr.year}</Typography.Text>}
                    >
                        <Row justify="space-between" align="middle">
                            <span>{cr.model_name}</span>
                            <Space>
                                <EditButton onClick={() => { showDrawer(); setSelectedCar(cr) }} />
                                <Tooltip title="Storico interventi">
                                    <Button icon={<HistoryOutlined />} onClick={() => setHistoryCar(cr)} />
                                </Tooltip>
                                <DeleteButton onConfirm={() => {
                                    api.deleteCar(cr.id).then(() => {
                                        message.success("Eliminato con successo!");
                                        reload();
                                    }).catch((e) => message.error("Errore nell'eliminazione: " + e))
                                }} />
                            </Space>
                        </Row>
                    </Card>
                )}
            />
        ) : (
            <Table virtual scroll={{ y: "calc(100vh - 230px)" }} dataSource={cars} columns={columns as any} rowKey="id" loading={loading} />
        )}
    </>
};

