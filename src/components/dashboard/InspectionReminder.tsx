import { Table, Typography } from "antd";
import { useEffect, useState } from "react";
import { getUpcomingInspections } from "../../modules/queries";
import { useDatabaseStore } from "../../modules/state";


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

const { Title } = Typography;

const columns = [
    {
        title: 'Auto',
        key: 'name',
        render: (_: any, record: DataType) => (`${record.maker_name} ${record.model_name} (${record.year})`)
    },
    {
        title: 'Cliente',
        dataIndex: 'customer_name',
        key: 'customer_name',
    },
    {
        title: 'Telefono',
        dataIndex: 'customer_phone',
        key: 'customer_phone',
    },
    {
        title: 'Data Ultima Revisione',
        dataIndex: 'last_inspection_date',
        key: 'last_inspection_date',
    },
];
export default function InspectionReminder(props: Props) {
    const { cars } = useDatabaseStore()
    const [inspections, setInspections] = useState<DataType[]>()


    useEffect(() => {
        if (cars.length) {
            getUpcomingInspections().then((data) => {
                setInspections(data as DataType[])
            })
        }
    }, [cars])
    return <div {...props}>
        <Title level={4}>Prossime revisioni</Title>
        <Table dataSource={inspections} columns={columns} loading={inspections === undefined} />
    </div>

}