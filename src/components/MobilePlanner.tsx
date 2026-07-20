import { DeleteOutlined, EditOutlined, LeftOutlined, PhoneOutlined, PlusOutlined, RightOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { Badge, Button, Calendar, Card, Dropdown, Empty, message, Modal, Row, Space, Tag, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { api } from "../modules/api";
import { DATE_FORMAT } from "../modules/dates";
import { useStore } from "../modules/state";
import { AppointmentEventData } from "../types/database";
import AppointmentForm from "./forms/AppointmentForm";

export default function MobilePlanner() {
    const { settings } = useStore((state) => state);
    const workshopId = settings.selectedWorkshop?.id;
    const [appointments, setAppointments] = useState<AppointmentEventData[]>([]);
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [editing, setEditing] = useState<AppointmentEventData>();
    const [creating, setCreating] = useState(false);

    function load() {
        api.getPlannerEvents(workshopId).then(setAppointments);
    }

    useEffect(load, [workshopId]);

    const appointmentsByDate = useMemo(() => {
        const map = new Map<string, number>();
        for (const a of appointments) {
            map.set(a.date, (map.get(a.date) ?? 0) + 1);
        }
        return map;
    }, [appointments]);

    const dayAppointments = useMemo(() => {
        const dateStr = currentDate.format(DATE_FORMAT);
        return appointments
            .filter(a => a.date === dateStr)
            .sort((a, b) => a.from_time.localeCompare(b.from_time));
    }, [appointments, currentDate]);

    function closeModal() {
        setEditing(undefined);
        setCreating(false);
    }

    function cellRender(date: Dayjs) {
        const count = appointmentsByDate.get(date.format(DATE_FORMAT)) ?? 0;
        return count > 0 ? <Badge count={count} size="small" style={{ position: "absolute", top: -2, right: -2 }} /> : null;
    }

    return <>
        <Modal open={!!editing || creating} onCancel={closeModal} footer={false}>
            <AppointmentForm
                style={{ marginTop: 40 }}
                appointmentId={editing?.id}
                onSubmit={() => { closeModal(); load(); }}
                initialData={creating ? { date: currentDate } as any : undefined}
            />
        </Modal>

        <Calendar
            fullscreen={false}
            value={currentDate}
            onSelect={(date) => setCurrentDate(date)}
            headerRender={({ value, onChange }) => (
                <Row justify="space-between" align="middle" style={{ padding: "8px 0" }}>
                    <Button type="text" icon={<LeftOutlined />} onClick={() => onChange(value.subtract(1, "month"))} />
                    <Typography.Text strong style={{ fontSize: 15, textTransform: "capitalize" }}>
                        {value.format("MMMM YYYY")}
                    </Typography.Text>
                    <Button type="text" icon={<RightOutlined />} onClick={() => onChange(value.add(1, "month"))} />
                </Row>
            )}
            fullCellRender={(date) => {
                const isSelected = date.isSame(currentDate, "day");
                const isToday = date.isSame(dayjs(), "day");
                return (
                    <div
                        style={{
                            position: "relative",
                            textAlign: "center",
                            padding: "4px 0",
                            borderRadius: 6,
                            background: isSelected ? "#1677ff" : undefined,
                            color: isSelected ? "#fff" : isToday ? "#1677ff" : undefined,
                            fontWeight: isToday || isSelected ? 700 : undefined,
                        }}
                    >
                        {date.date()}
                        {cellRender(date)}
                    </div>
                );
            }}
            style={{ marginBottom: 12 }}
        />

        {dayAppointments.length === 0 ? (
            <Empty description="Nessun appuntamento" style={{ marginTop: 40 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
                    Crea appuntamento
                </Button>
            </Empty>
        ) : (
            <>
                {dayAppointments.map(a => (
                    <Card key={a.id} size="small" style={{ marginBottom: 8 }}>
                        <Row justify="space-between" align="top">
                            <Space direction="vertical" size={2} style={{ flex: 1 }}>
                                <Space>
                                    <Tag color={a.estimate_status ? "green" : "orange"}>
                                        {a.from_time} - {a.to_time}
                                    </Tag>
                                </Space>
                                <Typography.Text strong>{a.customer_name}</Typography.Text>
                                <Typography.Text type="secondary">{a.car_info} · {a.number_plate}</Typography.Text>
                            </Space>
                            <Dropdown menu={{
                                items: [
                                    { key: "edit", label: "Modifica", icon: <EditOutlined /> },
                                    ...(a.customer_phone ? [
                                        { key: "call", label: "Chiama", icon: <PhoneOutlined /> },
                                        { key: "whatsapp", label: "WhatsApp", icon: <WhatsAppOutlined style={{ color: "#25D366" }} /> },
                                    ] : []),
                                    { type: "divider" as const },
                                    { key: "delete", label: "Elimina", icon: <DeleteOutlined />, danger: true },
                                ],
                                onClick: ({ key }) => {
                                    if (key === "edit") setEditing(a);
                                    else if (key === "call") window.open(`tel:${a.customer_phone}`);
                                    else if (key === "whatsapp") {
                                        const d = a.customer_phone.replace(/\D/g, "");
                                        window.open(`https://wa.me/${d.startsWith("39") ? d : `39${d}`}`);
                                    } else if (key === "delete") Modal.confirm({
                                        title: "Conferma eliminazione",
                                        content: "Sei sicuro di voler eliminare questo appuntamento?",
                                        okText: "Elimina",
                                        okType: "danger",
                                        cancelText: "Annulla",
                                        onOk: () => api.deleteAppointment(a.id).then(() => {
                                            message.success("Eliminato!");
                                            load();
                                        }).catch(e => message.error("Errore: " + e)),
                                    });
                                },
                            }}>
                                <Button type="text" icon={<EditOutlined />} />
                            </Dropdown>
                        </Row>
                    </Card>
                ))}
                <Row justify="center" style={{ marginTop: 16 }}>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
                        Nuovo appuntamento
                    </Button>
                </Row>
            </>
        )}
    </>;
}
