import { HistoryOutlined } from '@ant-design/icons';
import { Button, Drawer, Empty, List, Space, Spin, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { getDb } from '../modules/db/instance';
import { useQuery } from '../modules/hooks';
import { getLogoUrl } from '../modules/utils';
import { Car, Customer } from '../types/database';
import CarHistory from './CarHistory';

interface CustomerCarsProps {
    customer: Customer;
}

export default function CustomerCars({ customer }: CustomerCarsProps) {
    const { data: customerCars, loading } = useQuery<Car>(() => getDb().getCustomerCars(customer.id));
    const [historyCar, setHistoryCar] = useState<Car>();

    if (loading) {
        return <Spin style={{ display: 'block', margin: '40px auto' }} />;
    }

    if (!customerCars.length) {
        return <Empty description="Nessuna auto registrata per questo cliente" />;
    }

    return <>
        <List
            dataSource={customerCars}
            renderItem={(car) => (
                <List.Item
                    actions={[
                        <Tooltip title="Storico interventi" key="history">
                            <Button icon={<HistoryOutlined />} onClick={() => setHistoryCar(car)} />
                        </Tooltip>,
                    ]}
                >
                    <List.Item.Meta
                        avatar={
                            <img
                                src={getLogoUrl(car.maker_name ?? "")}
                                alt={car.maker_name}
                                title={car.maker_name}
                                style={{ height: 28, maxWidth: 60, objectFit: 'contain' }}
                                onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createElement('span'), { textContent: car.maker_name ?? "" })) }}
                            />
                        }
                        title={<Typography.Text strong>{car.number_plate}</Typography.Text>}
                        description={
                            <Space>
                                <span>{[car.maker_name, car.model_name].filter(Boolean).join(" ")}</span>
                                {car.year ? <Typography.Text type="secondary">({car.year})</Typography.Text> : null}
                            </Space>
                        }
                    />
                </List.Item>
            )}
        />
        <Drawer
            title={`Storico interventi — ${historyCar?.number_plate ?? ""}`}
            closable={{ 'aria-label': 'Chiudi' }}
            onClose={() => setHistoryCar(undefined)}
            open={!!historyCar}
            width={480}
        >
            {historyCar && <CarHistory car={historyCar} />}
        </Drawer>
    </>;
}
