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
import { update } from '../modules/database';
import { fromISOFormat, toISOFormat } from '../modules/dates';
import { getPlannerEvents } from '../modules/queries';
import { useDatabaseStore } from '../modules/state';
import "../styles/full-calendar-dark.css";
import { AppointmentEventData } from '../types/database';

interface EventProps extends EventImpl {
    extendedProps: {
        appointment: AppointmentEventData
    }
}

const mapAppointmentsToEvents = (appointments: AppointmentEventData[]) => {
    return appointments.map((appt) => {
        return {
            id: appt.id.toString(),
            title: `Appt #${appt.id}`,
            start: toISOFormat(appt.date, appt.from_time),
            end: toISOFormat(appt.date, appt.to_time),
            extendedProps: {
                appointment: appt,
            }
        }
    });
};

export default function Planner() {
    const [appointments, setAppointments] = useState<AppointmentEventData[]>([])
    const { appointments: appInDatabase } = useDatabaseStore()
    const [editing, setEditing] = useState<AppointmentEventData>()
    const [selectedDate, setSelectedDate] = useState<Date>()

    function getData() {
        getPlannerEvents().then((res) => setAppointments(res as any))
    }

    function close() {
        setEditing(undefined)
        setSelectedDate(undefined)
    }

    const events = useMemo(() => {
        return appointments ? mapAppointmentsToEvents(appointments) : [];
    }, [appointments, appInDatabase]);

    useEffect(() => {
        getData()
    }, [appInDatabase])


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

        update(newDates, appointment.id, () => {
            setAppointments(prev =>
                prev.map(appt =>
                    appt.id === appointment.id ? {
                        ...appointment,
                        ...newDates
                    } : appt
                )
            );
        }, "appointments", false)
    };


    return (
        <>

            <Modal open={!!editing || !!selectedDate} onCancel={close} footer={false} zIndex={99999}>
                <AppointmentForm style={{ marginTop: "40px" }} appointmentId={editing?.id} onSubmit={close} initialData={selectedDate && {
                    date: dayjs(selectedDate),
                    from_time: dayjs(selectedDate),
                } as any} />
            </Modal>

            <div id='calendar'>
                <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView='timeGridWeek'
                    headerToolbar={{
                        left: 'prev,next',
                        center: 'title',
                        right: 'timeGridWeek,timeGridDay'
                    }}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventDrop}
                    editable={true}
                    locale={itLocale}
                    events={events}
                    eventContent={(eventInfo) => {
                        const { event } = eventInfo;
                        const { extendedProps } = event as EventProps;
                        const { appointment } = extendedProps
                        return <PlannerEvent appointment={appointment} onDelete={getData} onEdit={(appointment) => { setEditing(appointment) }} />
                    }}
                    dateClick={(date) => {
                        setSelectedDate(date.date)
                    }}
                />
            </div>

        </>
    );
}
