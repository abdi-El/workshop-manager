import { EyeOutlined, FilePdfOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Empty, message, Space, Spin, Tag, Timeline, Tooltip, Typography } from 'antd';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { api } from '../modules/api';
import { Car, CarHistoryEntry, Estimate } from '../types/database';
import DetailModal from './detail/DetailModal';
import EstimateDetail from './detail/EstimateDetail';
const SaveEstimatePdf = lazy(() => import('./pdf/SavePdfButton'));

interface CarHistoryProps {
    car: Car;
}

export default function CarHistory({ car }: CarHistoryProps) {
    const [entries, setEntries] = useState<CarHistoryEntry[]>();
    const [detailEstimate, setDetailEstimate] = useState<Estimate>();

    useEffect(() => {
        setEntries(undefined);
        api.getCarHistory(car.id).then((rows) => {
            setEntries(rows);
        }).catch((error) => {
            message.error("Errore nel recupero dello storico: " + error);
            setEntries([]);
        });
    }, [car.id]);

    const kmData = useMemo(() =>
        (entries ?? [])
            .filter(e => e.car_kms)
            .map(e => ({ date: e.date, km: e.car_kms }))
            .reverse(),
    [entries]);

    function openDetail(estimateId: number) {
        api.getEstimate(estimateId).then((est) => {
            setDetailEstimate({ ...est, has_iva: (est.has_iva as any) == "true" });
        }).catch((e) => message.error("Errore: " + e));
    }

    if (!entries) {
        return <Spin style={{ display: 'block', margin: '40px auto' }} />;
    }

    if (!entries.length) {
        return <Empty description="Nessun intervento registrato per questa auto" />;
    }

    return <>
        {kmData.length >= 2 && (
            <Card size="small" title="Andamento chilometraggio" style={{ marginBottom: 16 }}>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={kmData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={50} />
                        <RTooltip formatter={(v) => [`${Number(v).toLocaleString()} km`, "Chilometraggio"]} />
                        <Line type="monotone" dataKey="km" stroke="#1677ff" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
        )}
        <Timeline
            items={entries.map((entry) => ({
                children: (
                    <Space direction="vertical" size={0}>
                        <Space>
                            <Typography.Text strong>{entry.date}</Typography.Text>
                            <Tag color="blue">€ {(entry.total ?? 0).toFixed(2)}</Tag>
                            {entry.car_kms ? (
                                <Typography.Text type="secondary">{entry.car_kms} km</Typography.Text>
                            ) : null}
                        </Space>
                        <Typography.Text>
                            {entry.labor_hours} ore di manodopera × € {entry.labor_hourly_cost}
                        </Typography.Text>
                        {entry.items_descriptions && (
                            <Typography.Text type="secondary">{entry.items_descriptions}</Typography.Text>
                        )}
                        {entry.discount ? (
                            <Typography.Text type="secondary">Sconto: € {entry.discount}</Typography.Text>
                        ) : null}
                        {entry.notes && (
                            <Typography.Text italic type="secondary">{entry.notes}</Typography.Text>
                        )}
                        <Space size={4} style={{ marginTop: 4 }}>
                            <Tooltip title="Dettaglio">
                                <Button icon={<EyeOutlined />} onClick={() => openDetail(entry.id)} />
                            </Tooltip>
                            <Suspense fallback={null}>
                                <SaveEstimatePdf estimateId={entry.id}>
                                    {({ save, preview }) => <>
                                        <Tooltip title="Anteprima PDF">
                                            <Button icon={<FilePdfOutlined />} onClick={preview} />
                                        </Tooltip>
                                        <Tooltip title="Salva PDF">
                                            <Button icon={<SaveOutlined />} onClick={save} />
                                        </Tooltip>
                                    </>}
                                </SaveEstimatePdf>
                            </Suspense>
                        </Space>
                    </Space>
                ),
            }))}
        />
        <DetailModal
            open={!!detailEstimate}
            onClose={() => setDetailEstimate(undefined)}
            title={detailEstimate ? `Lavoro — ${detailEstimate.customer_name ?? ""} ${detailEstimate.car_number_plate ?? ""}` : ""}
            footer={detailEstimate && <Suspense fallback={null}>
                <SaveEstimatePdf estimateId={detailEstimate.id} />
            </Suspense>}
        >
            {detailEstimate && <EstimateDetail estimate={detailEstimate} />}
        </DetailModal>
    </>;
}
