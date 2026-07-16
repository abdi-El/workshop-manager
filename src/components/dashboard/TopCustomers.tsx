import { Card } from "antd";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../../modules/api";

interface CustomerRevenue {
    customer_name: string;
    total_revenue: number;
    estimate_count: number;
}

export default function TopCustomers() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CustomerRevenue[]>([]);

    useEffect(() => {
        setLoading(true);
        api.getTopCustomersByRevenue().then((res) => {
            setData(res);
        }).finally(() => setLoading(false));
    }, []);

    return (
        <Card loading={loading} style={{ marginTop: 16 }} title="Top clienti per fatturato">
            <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `€${v}`} />
                    <YAxis type="category" dataKey="customer_name" width={120} />
                    <Tooltip
                        formatter={(v, _, props) => [
                            `€${Number(v).toFixed(2)} (${props.payload.estimate_count} lavori)`,
                            "Fatturato",
                        ]}
                    />
                    <Bar dataKey="total_revenue" fill="#52c41a" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}
