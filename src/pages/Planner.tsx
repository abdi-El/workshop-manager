import itLocale from '@fullcalendar/core/locales/it';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

export default function Planner() {
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
        />
    )
}