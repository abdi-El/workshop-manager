import { EyeOutlined, FilePdfOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Empty, message, Space, Spin, Tag, Timeline, Tooltip, Typography } from 'antd';
import { lazy, Suspense, useEffect, useState } from 'react';
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
