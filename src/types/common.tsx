import { Dayjs } from "dayjs";
import { Workshop } from "./database";
export interface SettingsType {
    theme: string;
    selectedWorkshop?: Workshop;
    makersPopulated?: boolean;
    activationKey: string
    activationDate?: Dayjs
}