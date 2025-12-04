import dayjs, { Dayjs } from "dayjs";
export const DATE_FORMAT = "DD-MM-YYYY"
export const TIME_FORMAT = "HH:mm"
export const OLDEST_CAR_YEAR = 1885
export function toISOFormat(dateString: string, timeString: string) {
    const [day, month, year] = dateString.split('-');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const isoDateTime = `${isoDate}T${timeString}:00`;
    return isoDateTime;
}

export function fromISOFormat(isoDateTime: string) {
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

export function transofrmYear(date: number | Dayjs) {
    if (date) {
        if (typeof date == "number") {
            return dayjs(`${date}-01-01`)
        } else {
            return date.year()
        }
    }
    return date
}

export function transformDate(date?: string | Dayjs | null) {
    if (!date) return null;
    if (typeof date === "string") {
        return dayjs(date, DATE_FORMAT);
    }
    return date.format(DATE_FORMAT);
}


export function sortBytDate(a: string, b: string) {
    return dayjs(a, "DD-MM-YYYY").valueOf() - dayjs(b, "DD-MM-YYYY").valueOf();
}