import { FieldTimeOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic } from "antd";

import { useEffect, useState } from "react";
import { db } from "../modules/database";
import { dashboardAverages } from "../modules/queries";
import { EstiamatesAverages } from "../types/database";


export default function Dashboard() {
    const [loading, setLoading] = useState(false)
    const [estimatesAverages, setEstimatesAverages] = useState<EstiamatesAverages>()
    useEffect(() => {
        if (db) {
            setLoading(true)
            db.select(dashboardAverages).then((res: any) => {
                setEstimatesAverages(res[0] as EstiamatesAverages)
            }).finally(() => {
                setLoading(false)
            })
        }
    }, [db])
    return <Row gutter={[16, 16]}>
        <Col span={8}>
            <Card variant="borderless">
                <Statistic
                    loading={loading}
                    title="Totale eseguiti"
                    value={estimatesAverages?.total_estimates}
                />
            </Card>
        </Col>
        <Col span={8}>
            <Card variant="borderless">
                <Statistic
                    loading={loading}
                    title="Totale medio"
                    value={estimatesAverages?.avg_total_estimate_value}
                    precision={2}
                    prefix="€"
                />
            </Card>
        </Col>
        <Col span={8}>
            <Card variant="borderless">
                <Statistic
                    loading={loading}
                    title="Costo mano d'opera medio"
                    value={estimatesAverages?.avg_hourly_cost}
                    precision={2}
                    prefix="€"
                />
            </Card>
        </Col>
        <Col span={8}>
            <Card variant="borderless">
                <Statistic
                    loading={loading}
                    title="Ore medie per lavoro"
                    value={estimatesAverages?.avg_labor_hours}
                    precision={2}
                    prefix={<FieldTimeOutlined />}
                />
            </Card>
        </Col>
        <Col span={8}>
            <Card variant="borderless">
                <Statistic
                    loading={loading}
                    title="Media Sconto"
                    value={estimatesAverages?.avg_discount}
                    precision={2}
                    prefix="€"
                />
            </Card>
        </Col>
        <Col span={8}>
            <Card variant="borderless">
                <Statistic
                    loading={loading}
                    title="Costo medio voci preventivo"
                    value={estimatesAverages?.avg_parts_cost}
                    precision={2}
                    prefix="€"
                />
            </Card>
        </Col>
    </Row>
}


