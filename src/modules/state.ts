import { message } from 'antd';
import { create } from 'zustand';
import { SettingsType } from '../types/common';
import { storeSettings } from './store';

export interface SearchTarget {
    table: "customers" | "cars" | "estimates"
    id: number
}

interface AppState {
    isDebug: boolean
    setIsDebug: (isDebug: boolean) => void
    page: string
    loading: boolean
    updatePage: (page: string) => void
    setLoading: (loading: boolean) => void
    settings: SettingsType
    updateSettings: (values?: Partial<SettingsType>) => void
    searchTarget?: SearchTarget
    setSearchTarget: (target?: SearchTarget) => void
    dbReady: boolean
    setDbReady: (dbReady: boolean) => void
}

export const useStore = create<AppState>()((set) => ({
    isDebug: false,
    setIsDebug: (isDebug) => set({ isDebug }),
    page: "dashboard",
    loading: false,
    updatePage: (page: string) => set((current) => {
        const actualPage = (!current.settings?.selectedWorkshop && page !== "workshop")
            ? "workshop"
            : page;
        if (actualPage !== page) {
            message.warning("Compila dati dell'officina prima di procedere.");
        }
        const newSettings = { ...current.settings, lastPage: actualPage };
        storeSettings.set('settings', newSettings);
        return { page: actualPage, settings: newSettings };
    }),
    setLoading: (loading: boolean) => set({ loading }),
    searchTarget: undefined,
    setSearchTarget: (searchTarget) => set({ searchTarget }),
    dbReady: false,
    setDbReady: (dbReady) => set({ dbReady }),
    settings: { theme: 'light', pdfTheme: 'default', showPdfNumber: true, showRevenueStatistics: true },
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
            storeSettings.get('settings').then(stored => {
                const settings = stored as SettingsType;
                set({ settings });
                if (!settings?.selectedWorkshop) {
                    set({ page: "workshop" });
                } else {
                    set({ page: settings?.lastPage ?? "dashboard" });
                }
            }).finally(() => set({ loading: false }))
        }

    },

}))
