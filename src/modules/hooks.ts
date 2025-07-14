import { message } from "antd";
import { create } from "zustand";
import { getModelsAndMakers } from "./scraper";

interface ScraperState {
    percentage: number,
    setPercentage: (percentage: number) => void
    loading: boolean,
    trigger: () => void
}
export const useScraper = create<ScraperState>()((set) => {
    return {
        percentage: 0,
        setPercentage: (percentage: number) => set({ percentage }),
        loading: false,
        trigger: () => set((curr) => {
            if (!curr.loading) {
                set({ percentage: 0 })
                set({ loading: true })
                getModelsAndMakers((percentage: number) => {
                    if (percentage == 100) {
                        message.success("Marche e Modelli importati con successo")
                        set({ loading: false })
                    }
                    set({ percentage })
                })
            }
            return {}
        }
        )
    }
})
