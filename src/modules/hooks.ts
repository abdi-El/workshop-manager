import { message } from "antd";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { storeSettings } from "./database";
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


async function updateTourState(name: string, value: boolean) {
    storeSettings.get("tours").then(values => {
        let newValues = {
            ...(values || {}), [name]: value
        }
        storeSettings.set("tours", newValues)
    })

}

export function useTour(name: string): [boolean, ((value: boolean) => Promise<void>)] {
    const [isOpen, setIsOpen] = useState(false)
    useEffect(() => {
        storeSettings.get("tours").then((values) => {
            setIsOpen((values as Record<string, boolean>)?.[name] || true)
        })
    }, [])
    async function setOpenState(value: boolean) {
        updateTourState(name, value)
        setIsOpen(value)
    }
    return [isOpen, setOpenState]
}