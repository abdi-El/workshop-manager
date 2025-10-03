import { Card, Row, Space, Statistic } from "antd";

import { useEffect, useState } from "react";
import { db } from '../../modules/database';
import { CarBrandsByCount } from '../../modules/queries';

interface DataType {
    brand_name: string,
    car_count: number
}


export default function CarsAVGS() {
    const [loading, setLoading] = useState(false)
    const [carsAverages, setCarsAverages] = useState<DataType[]>()
    useEffect(() => {
        if (db) {
            setLoading(true)
            db.select(CarBrandsByCount).then((res) => {
                setCarsAverages(res as DataType[])
            }).finally(() => {
                setLoading(false)
            })
        }
    }, [db])

    return <Row>
        <Card loading={loading} style={{ marginTop: 16, width: "100%" }} title="Auto riparate per numero">
            <Space size="large">
                {carsAverages?.slice(0, 10).map((item) => (
                    <Statistic
                        loading={loading}
                        key={item.brand_name}
                        title={item.brand_name}
                        value={item.car_count}
                        valueStyle={{ fontSize: 18 }}
                    />
                ))}
            </Space>
        </Card>
    </Row>
}


