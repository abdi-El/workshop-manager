import { message } from 'antd';
import { create } from 'zustand';
import { SettingsType } from '../types/common';
import { Car, Customer, Estimate, Maker, MakerModel, Workshop } from '../types/database';
import { db, storeSettings } from './database';


export interface DatabaseState {
    workshops: Workshop[]
    customers: Customer[]
    makers: Maker[]
    models: MakerModel[]
    cars: Car[]
    estimates: Estimate[]
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
const customQueries: Record<string, string> = {
    cars: `SELECT cars.id as car_id,
                cars.model_id,
                cars.maker_id,
                cars.*, 
                model.id as model_id,
                model.name as model_name,
                maker.id as maker_id,  maker.name as maker_name FROM cars 
            LEFT JOIN models as model ON cars.model_id = model.id 
            LEFT JOIN makers as maker ON cars.maker_id = maker.id`,
    estimates: `SELECT 
                    estimates.id as estimate_id,
                    estimates.car_id,
                    estimates.customer_id,
                    estimates.workshop_id,
                    estimates.*, 
                    -- add other specific estimates columns here (amount, date, status, etc.)
                    car.id as car_id,
                    car.number_plate as car_number_plate,
                    customer.id as customer_id,
                    customer.name as customer_name,
                    workshop.id as workshop_id,
                    workshop.name as workshop_name
                FROM estimates 
                LEFT JOIN cars as car ON estimates.car_id = car.id 
                LEFT JOIN customers as customer ON estimates.customer_id = customer.id 
                LEFT JOIN workshops as workshop ON estimates.workshop_id = workshop.id`,
}
export const useDatabaseStore = create<DatabaseState>()((set) => ({
    workshops: [],
    customers: [],
    makers: [],
    models: [],
    cars: [],
    estimates: [],
    databaseLoading: false,
    updateDatabaseData: (keys) => {
        keys.forEach(key => {
            set({ databaseLoading: true })
            db.select(customQueries[key] || `SELECT * FROM ${key}`).then((rows) => {
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
        if (!current.settings?.selectedWorkshop && page !== "workshop") {
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
                if (!(storeSettings as SettingsType)?.selectedWorkshop) {
                    set({ page: "workshop" })
                }
            }).finally(() => set({ loading: false }))
        }

    },

}))


