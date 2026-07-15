import { message } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { storeSettings } from "./store";
import { getModelsAndMakers } from "./scraper";

export function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export function useQuery<T>(queryFn: () => Promise<T[]>) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const fnRef = useRef(queryFn);
    fnRef.current = queryFn;

    const reload = useCallback(() => {
        setLoading(true);
        fnRef.current().then((rows) => {
            setData(rows);
        }).catch((error) => {
            message.error("Errore nel recupero dei dati: " + error);
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    return { data, loading, reload };
}

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
                }).catch((error) => {
                    message.error("Errore durante l'importazione di marche e modelli: " + error)
                    set({ loading: false, percentage: 100 })
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
            const storeValue = (values as Record<string, boolean>)?.[name]
            if (storeValue == undefined) {
                setIsOpen(true)
                return
            }
            setIsOpen(storeValue)
        })
    }, [])
    async function setOpenState(value: boolean) {
        updateTourState(name, value)
        setIsOpen(value)
    }
    return [isOpen, setOpenState]
}
