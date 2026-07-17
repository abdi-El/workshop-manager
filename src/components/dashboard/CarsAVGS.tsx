import { Card, Col, Row, Statistic } from "antd";

import { useEffect, useState } from "react";
import { api } from '../../modules/api';

interface DataType {
    brand_name: string,
    car_count: number
}


export default function CarsAVGS({ workshopId }: { workshopId?: number }) {
    const [loading, setLoading] = useState(false)
    const [carsAverages, setCarsAverages] = useState<DataType[]>()
    useEffect(() => {
        setLoading(true)
        api.getCarBrandsByCount(workshopId).then((res) => {
            setCarsAverages(res as DataType[])
        }).finally(() => {
            setLoading(false)
        })
    }, [workshopId])

    return <Row>
        <Card loading={loading} style={{ marginTop: 16, width: "100%" }} title="Auto riparate per numero">
            <Row gutter={[16, 16]}>
                {carsAverages?.slice(0, 10).map((item) => (
                    <Col xs={12} md={6} lg={4} key={item.brand_name}>
                        <Statistic
                            loading={loading}
                            title={item.brand_name}
                            value={item.car_count}
                            valueStyle={{ fontSize: 18 }}
                        />
                    </Col>
                ))}
            </Row>
        </Card>
    </Row>
}


