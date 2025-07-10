import { Button, Progress } from "antd"
import { useState } from "react"
import { getModelsAndMakers } from "../modules/scraper"

export default function MakersModelsImporter() {
    const [loading, setLoading] = useState<number>()
    async function onClick() {
        getModelsAndMakers(setLoading)
    }
    return <>
        {loading && <Progress percent={loading} />}
        <Button onClick={onClick} >Scrape</Button>
    </>
}