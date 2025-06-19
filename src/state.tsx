import { load } from '@tauri-apps/plugin-store';
import { create } from 'zustand';
import { SettingsType } from './types/common';

const store = await load('settings.json');





interface BearState {
    page: string
    loading: boolean
    updatePage: (page: string) => void
    setLoading: (loading: boolean) => void
    settings: SettingsType
    setSettings: (settings: SettingsType) => void
}

const useStore = create<BearState>()((set) => ({
    page: "estimates",
    loading: false,
    updatePage: (page: string) => set({ page }),
    setLoading: (loading: boolean) => set({ loading }),
    settings: { theme: 'light' },
    setSettings: (newSettings: SettingsType) => {
        set({ loading: true })
        store.set('settings', newSettings)
        set({ settings: newSettings })
        set({ loading: false })

    }
}))
export { useStore };

