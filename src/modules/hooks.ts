import { Grid, message } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { api } from "./api";

export function useIsMobile() {
    const screens = Grid.useBreakpoint();
    return !screens.md;
}

export function useDrawerWidth(desktop: number | string = 600) {
    return useIsMobile() ? "100%" : desktop;
}

export function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export function useQuery<T>(queryFn: () => Promise<T[]>, deps: unknown[] = []) {
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
    }, [reload, ...deps]);

    return { data, loading, reload };
}

interface ScraperState {
    percentage: number,
    setPercentage: (percentage: number) => void
    loading: boolean,
    trigger: () => void
    poll: () => void
}
export const useScraper = create<ScraperState>()((set, get) => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
        if (intervalId) return;
        intervalId = setInterval(() => {
            api.getScraperStatus().then((status) => {
                set({ percentage: Math.round(status.progress), loading: status.running });
                if (!status.running && status.progress >= 100) {
                    stopPolling();
                    message.success("Marche e Modelli importati con successo");
                }
            }).catch(() => {});
        }, 2000);
    }

    function stopPolling() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    return {
        percentage: 0,
        setPercentage: (percentage: number) => set({ percentage }),
        loading: false,
        trigger: () => {
            if (get().loading) return;
            set({ percentage: 0, loading: true });
            api.triggerScraper()
                .then(() => startPolling())
                .catch((e) => {
                    message.error("Errore: " + e);
                    set({ loading: false });
                });
        },
        poll: () => {
            api.getScraperStatus().then((status) => {
                set({ percentage: Math.round(status.progress), loading: status.running });
                if (status.running) startPolling();
            }).catch(() => {});
        },
    };
})


