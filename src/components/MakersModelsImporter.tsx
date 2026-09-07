import { UnorderedListOutlined } from "@ant-design/icons"
import { Button, Card, Drawer, Flex, Input, List, Modal, Progress, Row, Spin, Typography } from "antd"
import { useMemo, useState } from "react"
import { api } from "../modules/api"
import { useDrawerWidth, useQuery, useScraper } from "../modules/hooks"
import { getLogoUrl } from "../modules/utils"
import { Maker, MakerModel } from "../types/database"

function MakerModelsModal({ maker, onClose }: { maker: Maker | null; onClose: () => void }) {
    const { data: allModels, loading } = useQuery<MakerModel>(() => api.getModels(), [maker])
    const models = allModels.filter(m => m.maker_id === maker?.id)
    const [search, setSearch] = useState("")

    const filtered = useMemo(() => {
        if (!search) return models
        const q = search.toLowerCase()
        return models.filter(m => m.name.toLowerCase().includes(q))
    }, [models, search])

    return <Modal
        open={!!maker}
        onCancel={() => { onClose(); setSearch(""); }}
        footer={null}
        title={maker && <Row align="middle" style={{ gap: 10 }}>
            <img
                src={getLogoUrl(maker.name)}
                alt={maker.name}
                style={{ height: 28, maxWidth: 60, objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span>{maker.name} — {models.length} modelli</span>
        </Row>}
    >
        <Input.Search
            placeholder="Cerca modello..."
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 12 }}
        />
        <List
            loading={loading}
            dataSource={filtered}
            locale={{ emptyText: "Nessun modello trovato" }}
            size="small"
            renderItem={(model) => (
                <List.Item>
                    <Typography.Text>{model.name}</Typography.Text>
                </List.Item>
            )}
        />
    </Modal>
}

export function MakersCollapseLabel() {
    const { data: makersCount } = useQuery<{ count: number }>(() => api.getMakersCount())
    const hasMakers = (makersCount[0]?.count ?? 0) > 0
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedMaker, setSelectedMaker] = useState<Maker | null>(null)
    const [search, setSearch] = useState("")
    const { data: makers, loading: makersLoading } = useQuery<Maker>(() => api.getMakers(), [drawerOpen])
    const drawerWidth = useDrawerWidth("50%")

    const filtered = useMemo(() => {
        if (!search) return makers
        const q = search.toLowerCase()
        return makers.filter(m => m.name.toLowerCase().includes(q))
    }, [makers, search])

    return <>
        <Flex justify="space-between" align="center" style={{ width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <span onClick={(e) => { e.stopPropagation() }}>Importa marche e modelli</span>
            {hasMakers && <Button
                size="small"
                icon={<UnorderedListOutlined />}
                onClick={(e) => { e.stopPropagation(); setDrawerOpen(true); }}
            >
                Vedi tutte
            </Button>}
        </Flex>
        <Drawer
            title={`Marche (${makers.length})`}
            open={drawerOpen}
            onClose={() => { setDrawerOpen(false); setSearch(""); }}
            width={drawerWidth}
        >
            <Input.Search
                placeholder="Cerca marca..."
                allowClear
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            {makersLoading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> :
                <List
                    grid={{ gutter: 12, xs: 2, sm: 3, md: 3, lg: 4 }}
                    dataSource={filtered}
                    locale={{ emptyText: "Nessuna marca trovata" }}
                    renderItem={(maker) => (
                        <List.Item>
                            <Card
                                hoverable
                                size="small"
                                onClick={() => setSelectedMaker(maker)}
                                styles={{ body: { padding: 12, textAlign: 'center' } }}
                            >
                                <img
                                    src={getLogoUrl(maker.name)}
                                    alt={maker.name}
                                    style={{ height: 36, maxWidth: 70, objectFit: 'contain', marginBottom: 6 }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                />
                                <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {maker.name}
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            }
        </Drawer>
        <MakerModelsModal maker={selectedMaker} onClose={() => setSelectedMaker(null)} />
    </>
}

export default function MakersModelsImporter() {
    const { data: makersCount } = useQuery<{ count: number }>(() => api.getMakersCount())
    const hasMakers = (makersCount[0]?.count ?? 0) > 0
    const { percentage, loading, trigger } = useScraper(state => state)

    return <Row justify="center" style={{ margin: "15px 0px" }}>
        <Progress percent={percentage} size={["100%", 20]} />
        <Button onClick={trigger} loading={loading} className="w-100">
            {hasMakers ? "Aggiorna" : "Crea"} Marche e Modelli
        </Button>
    </Row>
}
