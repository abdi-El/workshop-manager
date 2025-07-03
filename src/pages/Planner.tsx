import itLocale from '@fullcalendar/core/locales/it';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useMemo } from 'react';
import { useDatabaseStore } from '../modules/state';
import { Appointment } from '../types/database';

function toISOFormat(dateString: string, timeString: string) {
    const [day, month, year] = dateString.split('-');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const isoDateTime = `${isoDate}T${timeString}:00`;
    return isoDateTime;
}

const mapAppointmentsToEvents = (appointments: Appointment[]) => {
    return appointments.map((appt) => {
        return {
            id: appt.id.toString(),
            title: `Appt #${appt.id}`,
            start: toISOFormat(appt.date, appt.from_time),
            end: toISOFormat(appt.date, appt.to_time),
        }
    });
};

export default function Planner() {
    const { appointments } = useDatabaseStore(state => state);

    const events = useMemo(() => {
        return appointments ? mapAppointmentsToEvents(appointments) : [];
    }, [appointments]);


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
        />
    );
}