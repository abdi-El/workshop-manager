import { EventImpl } from '@fullcalendar/core/internal';
import itLocale from '@fullcalendar/core/locales/it';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Modal } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import AppointmentForm from '../components/forms/AppointmentForm';
import PlannerEvent from '../components/PlannerEvent';
import { update } from '../modules/database';
import { getPlannerEvents } from '../modules/queries';
import { AppointmentEventData } from '../types/database';



interface EventProps extends EventImpl {
    extendedProps: {
        appointment: AppointmentEventData
    }
}



function toISOFormat(dateString: string, timeString: string) {
    const [day, month, year] = dateString.split('-');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const isoDateTime = `${isoDate}T${timeString}:00`;
    return isoDateTime;
}

function fromISOFormat(isoDateTime: string) {
    const date = new Date(isoDateTime);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return {
        date: `${day}-${month}-${year}`,
        time: `${hours}:${minutes}`
    };
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
    const [editing, setEditing] = useState<AppointmentEventData>()
    function getData() {
        getPlannerEvents().then((res) => setAppointments(res as any))
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
            <Modal open={!!editing} onCancel={() => setEditing(undefined)} onOk={() => setEditing(undefined)} zIndex={99999}>
                <AppointmentForm appointmentId={editing?.id} />
            </Modal>
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

            />
        </>
    );
}
