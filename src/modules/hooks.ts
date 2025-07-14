import { message } from "antd";
import { useState } from "react";
import { getModelsAndMakers } from "./scraper";
import { useDatabaseStore, useStore } from "./state";

export function useScraper() {
    const [scraperLoading, setScraperLoading] = useState(false)
    const { setLoading } = useStore(state => state)
    const { updateDatabaseData, makers } = useDatabaseStore()
    const [percentage, setPercentage] = useState(makers.length ? 100 : 0)

    function trigger(globalLoading: boolean = false) {
        setScraperLoading(true)
        if (globalLoading) {
            setLoading(true)
        }
        getModelsAndMakers((percentage: number) => {
            if (percentage == 100) {
                setScraperLoading(false)
                if (globalLoading) {
                    setLoading(false)
                }
                message.success("Marche e Modelli importati con successo")
                updateDatabaseData(["makers", "models"])
            }
            setPercentage(percentage)
        })
    }
    return { trigger, percentage, scraperLoading }
}