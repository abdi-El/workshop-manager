import { Card, Col, Row, Statistic } from "antd";

import { useEffect, useState } from "react";
import { getDb } from '../../modules/db/instance';

interface DataType {
    brand_name: string,
    car_count: number
}


export default function CarsAVGS() {
    const [loading, setLoading] = useState(false)
    const [carsAverages, setCarsAverages] = useState<DataType[]>()
    useEffect(() => {
        setLoading(true)
        getDb().getCarBrandsByCount().then((res) => {
            setCarsAverages(res as DataType[])
        }).finally(() => {
            setLoading(false)
        })
    }, [])

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


