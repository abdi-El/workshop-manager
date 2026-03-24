import { Card } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { db } from "../../modules/database";
import { monthlyRevenue } from "../../modules/queries";

interface MonthlyData {
    month: string;
    total_revenue: number;
}

export default function RevenueChart() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<MonthlyData[]>([]);

    useEffect(() => {
        if (db) {
            setLoading(true);
            db.select(monthlyRevenue).then((res) => {
                setData(res as MonthlyData[]);
            }).finally(() => setLoading(false));
        }
    }, [db]);

    const formatted = data.map(d => ({
        ...d,
        label: dayjs(d.month, "YYYY-MM").format("MMM YY"),
    }));

    return (
        <Card loading={loading} style={{ marginTop: 16 }} title="Fatturato mensile">
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={formatted}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis tickFormatter={(v) => `€${v}`} width={80} />
                    <Tooltip formatter={(v) => [`€${Number(v).toFixed(2)}`, "Fatturato"]} />
                    <Bar dataKey="total_revenue" fill="#1677ff" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}
