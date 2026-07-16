import { CalendarOutlined } from "@ant-design/icons";
import { Collapse, Descriptions, Empty, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { api } from "../../modules/api";


interface Props extends React.HTMLAttributes<HTMLDivElement> {
}

interface DataType {
    car_id: number
    customer_id: number
    customer_name: string
    customer_phone?: string
    last_inspection_date?: string
    year: number
    maker_name: string
    model_name: string
}

const { Title, Text } = Typography;

export default function InspectionReminder(props: Props) {
    const [inspections, setInspections] = useState<DataType[]>()

    useEffect(() => {
        api.getUpcomingInspections().then((data) => {
            setInspections(data as DataType[])
        })
    }, [])

    const items = (inspections ?? []).map((record) => ({
        key: record.car_id,
        label: (
            <span>
                <strong>{record.maker_name} {record.model_name}</strong>
                <Text type="secondary"> ({record.year})</Text>
            </span>
        ),
        extra: record.last_inspection_date && (
            <Text type="secondary" style={{ fontSize: 12 }}>
                <CalendarOutlined /> {record.last_inspection_date}
            </Text>
        ),
        children: (
            <Descriptions column={1} size="small">
                <Descriptions.Item label="Cliente">{record.customer_name}</Descriptions.Item>
                <Descriptions.Item label="Telefono">
                    {record.customer_phone
                        ? <a href={`tel:${record.customer_phone}`}>{record.customer_phone}</a>
                        : "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Ultima revisione">
                    {record.last_inspection_date ?? "—"}
                </Descriptions.Item>
            </Descriptions>
        ),
    }));

    return <div {...props}>
        <Title level={4}>Prossime revisioni</Title>
        {inspections === undefined
            ? <Spin style={{ display: 'block', margin: '40px auto' }} />
            : items.length
                ? <Collapse items={items} />
                : <Empty description="Nessuna revisione in scadenza" />}
    </div>
}
