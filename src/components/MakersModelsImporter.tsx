import { Button, Progress, Row } from "antd"
import { useDbQuery, useScraper } from "../modules/hooks"

export default function MakersModelsImporter() {
    const { data: makers } = useDbQuery<{ count: number }>(`SELECT COUNT(*) as count FROM makers`)
    const hasMakers = (makers[0]?.count ?? 0) > 0
    const { percentage, loading, trigger } = useScraper(state => state)

    return <Row justify={"center"} style={{ margin: "15px 0px" }}>
        <Progress percent={percentage} size={["100%", 20]} />
        <Button onClick={trigger} loading={loading} className="w-100" >{hasMakers ? "Aggiorna" : "Crea"} Marche e Modelli</Button>
    </Row>
}