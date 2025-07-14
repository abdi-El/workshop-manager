import { Button, Progress, Row } from "antd"
import { useScraper } from "../modules/hooks"
import { useDatabaseStore } from "../modules/state"

export default function MakersModelsImporter() {
    const { makers, } = useDatabaseStore()
    const { percentage, loading, trigger } = useScraper(state => state)

    return <Row justify={"center"} style={{ margin: "15px 0px" }}>
        <Progress percent={percentage} size={["100%", 20]} />
        <Button onClick={trigger} loading={loading} className="w-100" >{makers.length ? "Aggiorna" : "Crea"} Marche e Modelli</Button>
    </Row>
}