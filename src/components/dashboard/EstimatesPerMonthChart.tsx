import { Card } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../../modules/api";

export default function EstimatesPerMonthChart({ workshopId }: { workshopId?: number }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<{ month: string; estimate_count: number }[]>([]);

    useEffect(() => {
        setLoading(true);
        api.getEstimatesPerMonth(workshopId).then(setData).finally(() => setLoading(false));
    }, [workshopId]);

    const formatted = data.map(d => ({
        ...d,
        label: dayjs(d.month, "YYYY-MM").format("MMM YY"),
    }));

    return (
        <Card loading={loading} style={{ marginTop: 16 }} title="Lavori per mese">
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={formatted}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(v) => [v, "Lavori"]} />
                    <Bar dataKey="estimate_count" fill="#1677ff" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}
