import { Card, Row } from "antd";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getDb } from "../../modules/db/instance";

interface DataType {
    year: string;
    car_count: number;
}

export default function CarsByYearChart() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<DataType[]>([])

    useEffect(() => {
        setLoading(true)
        getDb().getCarsByYear().then((res) => {
            setData(res as DataType[])
        }).finally(() => {
            setLoading(false)
        })
    }, [])

    return <Row>
        <Card loading={loading} style={{ marginTop: 16, width: "100%" }} title="Auto per anno di immatricolazione">
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value) => [value, "Auto"]} />
                    <Bar dataKey="car_count" name="Auto" fill="#1677ff" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    </Row>
}
