import { Empty, message, Space, Spin, Tag, Timeline, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getDb } from '../modules/db/instance';
import { Car, CarHistoryEntry } from '../types/database';

interface CarHistoryProps {
    car: Car;
}

export default function CarHistory({ car }: CarHistoryProps) {
    const [entries, setEntries] = useState<CarHistoryEntry[]>();

    useEffect(() => {
        setEntries(undefined);
        getDb().getCarHistory(car.id).then((rows) => {
            setEntries(rows);
        }).catch((error) => {
            message.error("Errore nel recupero dello storico: " + error);
            setEntries([]);
        });
    }, [car.id]);

    if (!entries) {
        return <Spin style={{ display: 'block', margin: '40px auto' }} />;
    }

    if (!entries.length) {
        return <Empty description="Nessun intervento registrato per questa auto" />;
    }

    return <Timeline
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
                </Space>
            ),
        }))}
    />;
}
