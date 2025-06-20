import { message } from 'antd';
import { create } from 'zustand';
import { db, storeSettings } from './database';
import { SettingsType } from './types/common';
import { Workshop } from './types/database';



interface BearState {
    page: string
    loading: boolean
    updatePage: (page: string) => void
    setLoading: (loading: boolean) => void
    settings: SettingsType
    updateSettings: (values?: SettingsType) => void
    workshops: Workshop[] // Placeholder for workshops, replace with actual type
    updateWorkshops: () => void
}

const useStore = create<BearState>()((set) => ({
    page: "estimates",
    loading: false,
    updatePage: (page: string) => set({ page }),
    setLoading: (loading: boolean) => set({ loading }),
    settings: { theme: 'light' },
    updateSettings: (values) => {
        set({ loading: true })
        if (values) {
            storeSettings.set('settings', values).then(_ => {
                set({ settings: values })
            }).finally(() => set({ loading: false }))
        } else {
            storeSettings.get('settings').then(storeSettings => {
                set({ settings: storeSettings as SettingsType })
            }).finally(() => set({ loading: false }))
        }

    },
    workshops: [],
    updateWorkshops() {
        set({ loading: true })
        db.select<Workshop[]>(`SELECT * FROM workshops`).then((rows: Workshop[]) => {
            set({ workshops: rows })
        }).catch((error) => {
            message.error("Errore nel recupero delle officine: " + error);
        }).finally(() => set({ loading: false }))
    }
}))
export { useStore };

