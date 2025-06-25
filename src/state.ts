import { message } from 'antd';
import { create } from 'zustand';
import { db, storeSettings } from './database';
import { SettingsType } from './types/common';
import { Customer, Workshop } from './types/database';



interface AppState {
    page: string
    loading: boolean
    updatePage: (page: string) => void
    setLoading: (loading: boolean) => void
    settings: SettingsType
    updateSettings: (values?: Partial<SettingsType>) => void
    workshops: Workshop[] // Placeholder for workshops, replace with actual type
    customers: Customer[] // Placeholder for workshops, replace with actual type
    updateDatabaseData: (key: (keyof AppState)[]) => void
}

const useStore = create<AppState>()((set) => ({
    page: "estimates",
    loading: false,
    updatePage: (page: string) => set((current) => {
        if (!current.settings.selectedWorkshop && page !== "workshop") {
            message.warning("Seleziona un'officina prima di procedere.");
            return { page: "workshop" }
        }
        return { page }
    }
    ),
    setLoading: (loading: boolean) => set({ loading }),
    settings: { theme: 'light' },
    updateSettings: (values) => {
        set({ loading: true })
        if (values) {
            set((old) => {
                const newValues = { ...old.settings, ...values }
                storeSettings.set('settings', newValues).then(_ => {
                }).finally(() => set({ loading: false }))
                return { settings: newValues }
            })
        } else {
            storeSettings.get('settings').then(storeSettings => {
                set({ settings: storeSettings as SettingsType })
                if (!(storeSettings as SettingsType).selectedWorkshop) {
                    set({ page: "workshop" })
                }
            }).finally(() => set({ loading: false }))
        }

    },
    workshops: [],
    customers: [],
    updateDatabaseData(keys: string[]) {
        keys.forEach(key => {
            set({ loading: true })
            db.select<Workshop[]>(`SELECT * FROM ${key}`).then((rows) => {
                set({ [key]: rows })
            }).catch((error) => {
                message.error("Errore nel recupero delle officine: " + error);
            }).finally(() => set({ loading: false }))
        })
    }
}))
export { useStore };

