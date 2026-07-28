import { Workshop } from "./database";
export interface SettingsType {
    theme: string;
    selectedWorkshop?: Workshop;
    makersPopulated?: boolean;
    pdfTheme: string;
    lastPage?: string;
    showPdfNumber: boolean;
    showRevenueStatistics: boolean;
    showEstimatesOnCalendar: boolean;
    defaultWhatsappMessage: string;
    defaultEstimateNotes: string;
    defaultAppointmentDuration: number;
}