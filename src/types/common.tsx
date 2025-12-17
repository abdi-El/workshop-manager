import { Workshop } from "./database";
export interface SettingsType {
    theme: string;
    selectedWorkshop?: Workshop;
    makersPopulated?: boolean;
    supabase?: { supabaseUrl: string, supabaseKey: string }
}