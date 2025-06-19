import { create } from 'zustand';




interface BearState {
    page: string
    updatePage: (page: string) => void
}

const useStore = create<BearState>()((set) => ({
    page: "estimates",
    updatePage: (page: string) => set({ page }),
}))
export { useStore };

