import dayGridPlugin from '@fullcalendar/daygrid';
import { EventImpl } from '@fullcalendar/core/internal';
import itLocale from '@fullcalendar/core/locales/it';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Descriptions, Modal, Popover, Tag } from 'antd';
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from 'react';
import AppointmentForm from '../components/forms/AppointmentForm';
import MobilePlanner from '../components/MobilePlanner';
import PlannerEvent from '../components/PlannerEvent';
import { api } from '../modules/api';
import { fromISOFormat, toISOFormat } from '../modules/dates';
import { useIsMobile } from '../modules/hooks';
import { useStore } from '../modules/state';
import "../styles/full-calendar-dark.css";
import { AppointmentEventData, Estimate } from '../types/database';

interface EventProps extends EventImpl {
    extendedProps: {
        appointment?: AppointmentEventData
        estimate?: Estimate
    }
}

function ddmmyyyyToISO(date: string) {
    const [d, m, y] = date.split('-');
    return `${y}-${m}-${d}`;
}

const mapAppointmentsToEvents = (appointments: AppointmentEventData[]) => {
    return appointments.map((appt) => ({
        id: `appt-${appt.id}`,
        title: appt.customer_name || `Appt #${appt.id}`,
        start: toISOFormat(appt.date, appt.from_time),
        end: toISOFormat(appt.date, appt.to_time),
        backgroundColor: appt.estimate_status ? '#52c41a' : '#faad14',
        borderColor: appt.estimate_status ? '#389e0d' : '#d48806',
        extendedProps: {
            appointment: appt,
        }
    }));
};

const mapEstimatesToEvents = (estimates: Estimate[]) => {
    return estimates.map((est) => ({
        id: `est-${est.id}`,
        title: `${est.customer_name} · ${est.car_number_plate}`,
        start: ddmmyyyyToISO(est.date),
        allDay: true,
        backgroundColor: '#1677ff',
        borderColor: '#0958d9',
        extendedProps: {
            estimate: est,
        }
    }));
};

export default function Planner() {
    const isMobile = useIsMobile();
    const { settings } = useStore((state) => state);
    const workshopId = settings.selectedWorkshop?.id;
    const [appointments, setAppointments] = useState<AppointmentEventData[]>([])
    const [estimates, setEstimates] = useState<Estimate[]>([])
    const [editing, setEditing] = useState<AppointmentEventData>()
    const [selectedDate, setSelectedDate] = useState<Date>()

    const showEstimates = settings.showEstimatesOnCalendar;

    function getData() {
        api.getPlannerEvents(workshopId).then(setAppointments)
        if (showEstimates) api.getEstimates(workshopId).then(setEstimates)
        else setEstimates([])
    }

    function close() {
        setEditing(undefined)
        setSelectedDate(undefined)
    }

    const events = useMemo(() => {
        return [
            ...mapAppointmentsToEvents(appointments),
            ...mapEstimatesToEvents(estimates),
        ];
    }, [appointments, estimates]);

    useEffect(() => {
        getData()
    }, [workshopId, showEstimates])


    const handleEventDrop = (info: any) => {
        const { event } = info;
        const { extendedProps } = event as EventProps;
        const { appointment } = extendedProps;
        if (!appointment) return;

        const newStart = fromISOFormat(event.start.toISOString());
        const newEnd = fromISOFormat(event.end.toISOString());
        const newDates = {
            date: newStart.date,
            from_time: newStart.time,
            to_time: newEnd.time
        }

        api.updateAppointment(appointment.id, newDates).then(() => {
            setAppointments(prev =>
                prev.map(appt =>
                    appt.id === appointment.id ? { ...appointment, ...newDates } : appt
                )
            );
        })
    };


    if (isMobile) return <MobilePlanner />;

    return (
        <>
            <Modal open={!!editing || !!selectedDate} onCancel={close} footer={false} zIndex={99999}>
                <AppointmentForm style={{ marginTop: "40px" }} appointmentId={editing?.id} onSubmit={() => { close(); getData(); }} initialData={selectedDate && {
                    date: dayjs(selectedDate),
                    from_time: dayjs(selectedDate),
                } as any} />
            </Modal>

            <div id='calendar'>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView='timeGridWeek'
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    height="calc(100vh - 200px)"
                    nowIndicator={true}
                    scrollTime="08:00:00"
                    slotMinTime="06:00:00"
                    slotMaxTime="21:00:00"
                    businessHours={{
                        daysOfWeek: [1, 2, 3, 4, 5, 6],
                        startTime: '08:00',
                        endTime: '18:00',
                    }}
                    dayMaxEvents={3}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventDrop}
                    editable={true}
                    locale={itLocale}
                    events={events}
                    eventContent={(eventInfo) => {
                        const { event } = eventInfo;
                        const { extendedProps } = event as EventProps;
                        const { appointment, estimate } = extendedProps;

                        if (estimate) {
                            return <Popover
                                trigger="click"
                                title={<>Preventivo #{estimate.id}</>}
                                content={<Descriptions size="small" column={1} bordered labelStyle={{ fontWeight: 600 }}>
                                    <Descriptions.Item label="Cliente">{estimate.customer_name}</Descriptions.Item>
                                    <Descriptions.Item label="Targa">{estimate.car_number_plate}</Descriptions.Item>
                                    <Descriptions.Item label="Data">{estimate.date}</Descriptions.Item>
                                    {estimate.total != null && <Descriptions.Item label="Totale">
                                        <Tag color="blue">{Number(estimate.total).toFixed(2)} €</Tag>
                                    </Descriptions.Item>}
                                </Descriptions>}
                            >
                                <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 2px', cursor: 'pointer' }}>
                                    {estimate.customer_name} · {estimate.car_number_plate}
                                </div>
                            </Popover>;
                        }

                        if (!appointment) return null;

                        if (eventInfo.view.type === 'dayGridMonth') {
                            return <PlannerEvent appointment={appointment} onDelete={getData} onEdit={(appointment) => { setEditing(appointment) }}>
                                <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 2px' }}>
                                    <strong>{appointment.from_time}</strong> {appointment.customer_name} · {appointment.number_plate}
                                </div>
                            </PlannerEvent>;
                        }
                        return <PlannerEvent appointment={appointment} onDelete={getData} onEdit={(appointment) => { setEditing(appointment) }}>
                            <div style={{ padding: '2px 4px', fontSize: 12, lineHeight: 1.3 }}>
                                <div style={{ fontWeight: 600 }}>{appointment.customer_name}</div>
                                <div>{appointment.number_plate} · {appointment.car_info}</div>
                            </div>
                        </PlannerEvent>;
                    }}
                    dateClick={(date) => {
                        setSelectedDate(date.date)
                    }}
                />
            </div>
        </>
    );
}
