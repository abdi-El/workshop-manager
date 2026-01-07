import { Workshop } from "./database";
export interface SettingsType {
    theme: string;
    selectedWorkshop?: Workshop;
    makersPopulated?: boolean;
}