import { message } from 'antd';
import { create } from 'zustand';
import { SettingsType } from '../types/common';
import { api } from './api';

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

const defaultSettings: SettingsType = { theme: 'light', pdfTheme: 'default', showPdfNumber: true, showRevenueStatistics: true };

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
        api.saveSettings(newSettings).catch(() => {});
        return { page: actualPage, settings: newSettings };
    }),
    setLoading: (loading: boolean) => set({ loading }),
    searchTarget: undefined,
    setSearchTarget: (searchTarget) => set({ searchTarget }),
    dbReady: false,
    setDbReady: (dbReady) => set({ dbReady }),
    settings: defaultSettings,
    updateSettings: (values) => {
        set({ loading: true })
        if (values) {
            set((old) => {
                const newValues = { ...old.settings, ...values }
                api.saveSettings(newValues).finally(() => set({ loading: false }));
                return { settings: newValues }
            })
        } else {
            api.getSettings().then(stored => {
                const settings = stored as unknown as SettingsType;
                if (!settings || !settings.theme) {
                    set({ page: "workshop", loading: false });
                    return;
                }
                set({ settings: { ...defaultSettings, ...settings } });
                if (!settings?.selectedWorkshop) {
                    set({ page: "workshop" });
                } else {
                    set({ page: settings?.lastPage ?? "dashboard" });
                }
            }).catch(() => {
                set({ page: "workshop" });
            }).finally(() => set({ loading: false }))
        }
    },
}))
