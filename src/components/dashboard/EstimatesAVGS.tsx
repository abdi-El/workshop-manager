import { FieldTimeOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic } from "antd";

import { useEffect, useState } from "react";
import { api } from '../../modules/api';
import { EstiamatesAverages } from '../../types/database';


export default function EstimatesAVGS({ workshopId }: { workshopId?: number }) {
    const [loading, setLoading] = useState(false)
    const [estimatesAverages, setEstimatesAverages] = useState<EstiamatesAverages>()
    useEffect(() => {
        setLoading(true)
        api.getDashboardAverages(workshopId).then((res) => {
            setEstimatesAverages(res[0])
        }).finally(() => {
            setLoading(false)
        })
    }, [workshopId])
    return <Row gutter={[16, 16]}>
        <Col xs={12} md={8}>
            <Card variant="borderless">
                <Statistic
                    loading={loading}
                    title="Totale eseguiti"
                    value={estimatesAverages?.total_estimates}
                />
            </Card>
        </Col>
        <Col xs={12} md={8}>
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
        <Col xs={12} md={8}>
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
        <Col xs={12} md={8}>
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
        <Col xs={12} md={8}>
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
        <Col xs={12} md={8}>
            <Card variant="borderless">
                <Statistic
                    loading={loading}
                    title="Costo medio voci lavoro"
                    value={estimatesAverages?.avg_parts_cost}
                    precision={2}
                    prefix="€"
                />
            </Card>
        </Col>
    </Row>
}


