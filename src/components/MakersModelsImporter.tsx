import { Button, message, Progress, Row } from "antd"
import { useEffect, useState } from "react"
import { getModelsAndMakers } from "../modules/scraper"
import { useDatabaseStore } from "../modules/state"

export default function MakersModelsImporter() {
    const { makers, updateDatabaseData } = useDatabaseStore()
    const [percent, setPercent] = useState<number>(makers.length ? 100 : 0)
    const [isLoading, setIsLoading] = useState(false)

    async function onClick() {
        setIsLoading(true)
        getModelsAndMakers((percentage: number) => {
            if (percentage == 100) {
                setIsLoading(false)
                message.success("Marche e Modelli importati con successo")
                updateDatabaseData(["makers", "models"])
            }
            setPercent(percentage)
        })
    }

    useEffect(() => { }, [])
    return <Row justify={"center"} style={{ margin: "15px 0px" }}>
        <Progress percent={percent} size={["100%", 20]} />
        <Button onClick={onClick} loading={isLoading} className="w-100" >{makers.length ? "Aggiorna" : "Crea"} Marche e Modelli</Button>
    </Row>
}