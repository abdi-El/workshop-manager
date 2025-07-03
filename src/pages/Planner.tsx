import { EventImpl } from '@fullcalendar/core/internal';
import itLocale from '@fullcalendar/core/locales/it';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { getPlannerEvents } from '../modules/queries';

interface AppointmentEventData {
    id: number,
    workshop_id: number,
    date: string,
    from_time: string,
    to_time: string,
    customer_name: string,
    customer_phone: string,
    car_info: string,
    number_plate: string,
    estimate_status: boolean
}

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

    const events = useMemo(() => {
        return appointments ? mapAppointmentsToEvents(appointments) : [];
    }, [appointments]);

    useEffect(() => {
        getPlannerEvents().then((res) => setAppointments(res as any))
    }, [])


    return (
        <FullCalendar
            plugins={[timeGridPlugin]}
            initialView='timeGridWeek'
            headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: 'timeGridWeek,timeGridDay'
            }}
            locale={itLocale}
            events={events}
            eventContent={(eventInfo) => {
                const { event } = eventInfo;
                const { extendedProps } = event as EventProps;
                const { appointment } = extendedProps
                return <Tooltip title="prompt text">
                    <div>{appointment.car_info} di {appointment.customer_name}</div>
                </Tooltip>
            }}
        />
    );
}
