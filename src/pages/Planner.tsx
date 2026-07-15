import dayGridPlugin from '@fullcalendar/daygrid';
import { EventImpl } from '@fullcalendar/core/internal';
import itLocale from '@fullcalendar/core/locales/it';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Modal } from 'antd';
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from 'react';
import AppointmentForm from '../components/forms/AppointmentForm';
import PlannerEvent from '../components/PlannerEvent';
import { getDb } from '../modules/db/instance';
import { fromISOFormat, toISOFormat } from '../modules/dates';
import "../styles/full-calendar-dark.css";
import { AppointmentEventData } from '../types/database';

interface EventProps extends EventImpl {
    extendedProps: {
        appointment: AppointmentEventData
    }
}

const mapAppointmentsToEvents = (appointments: AppointmentEventData[]) => {
    return appointments.map((appt) => ({
        id: appt.id.toString(),
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

export default function Planner() {
    const [appointments, setAppointments] = useState<AppointmentEventData[]>([])
    const [editing, setEditing] = useState<AppointmentEventData>()
    const [selectedDate, setSelectedDate] = useState<Date>()

    function getData() {
        getDb().getPlannerEvents().then((res) => setAppointments(res))
    }

    function close() {
        setEditing(undefined)
        setSelectedDate(undefined)
    }

    const events = useMemo(() => {
        return appointments ? mapAppointmentsToEvents(appointments) : [];
    }, [appointments]);

    useEffect(() => {
        getData()
    }, [])


    const handleEventDrop = (info: any) => {
        const { event } = info;
        const { extendedProps } = event as EventProps;
        const { appointment } = extendedProps;

        const newStart = fromISOFormat(event.start.toISOString());
        const newEnd = fromISOFormat(event.end.toISOString());
        const newDates = {
            date: newStart.date,
            from_time: newStart.time,
            to_time: newEnd.time
        }

        getDb().update(newDates, appointment.id, "appointments").then(() => {
            setAppointments(prev =>
                prev.map(appt =>
                    appt.id === appointment.id ? {
                        ...appointment,
                        ...newDates
                    } : appt
                )
            );
        })
    };


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
                    eventDrop={handleEventDrop}
                    eventResize={handleEventDrop}
                    editable={true}
                    locale={itLocale}
                    events={events}
                    eventContent={(eventInfo) => {
                        const { event } = eventInfo;
                        const { extendedProps } = event as EventProps;
                        const { appointment } = extendedProps;
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
