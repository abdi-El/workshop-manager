import { message } from 'antd';
import { create } from 'zustand';
import { SettingsType } from '../types/common';
import { Car, Customer, Maker, MakerModel, Workshop } from '../types/database';
import { db, storeSettings } from './database';


export interface DatabaseState {
    workshops: Workshop[]
    customers: Customer[]
    makers: Maker[]
    models: MakerModel[]
    cars: Car[]
    databaseLoading: boolean
    updateDatabaseData: (key: (keyof DatabaseState)[]) => void
}

interface AppState {
    page: string
    loading: boolean
    updatePage: (page: string) => void
    setLoading: (loading: boolean) => void
    settings: SettingsType
    updateSettings: (values?: Partial<SettingsType>) => void

}

export const useDatabaseStore = create<DatabaseState>()((set) => ({
    workshops: [],
    customers: [],
    makers: [],
    models: [],
    cars: [],
    databaseLoading: false,
    updateDatabaseData: (keys) => {
        keys.forEach(key => {
            set({ databaseLoading: true })
            db.select<Workshop[]>(`SELECT * FROM ${key}`).then((rows) => {
                set({ [key]: rows })
            }).catch((error) => {
                message.error("Errore nel recupero dei dati: " + error);
            }).finally(() => set({ databaseLoading: false }))
        })
    }
}))



export const useStore = create<AppState>()((set) => ({
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

}))


