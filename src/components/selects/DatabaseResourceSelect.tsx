import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Row, Select } from "antd";
import { useEffect, useState } from "react";
import { DatabaseState, useDatabaseStore } from "../../modules/state";



type Resource = Exclude<keyof DatabaseState, "databaseLoading" | "updateDatabaseData">

export interface DatabaseSelectProps extends React.ComponentProps<typeof Form.Item> {
    resource: Resource
    selectLabel: string
    name: string
    inputLabel: string
    allowClear?: boolean
    filterFunc?: (el: any) => boolean
    onAddClick?: () => void
}

export default function DatabasResourceSelect<T extends { id: number }>({ resource, selectLabel, name, inputLabel, allowClear, filterFunc, onAddClick, ...props }: DatabaseSelectProps) {
    const databaseData = useDatabaseStore((state) => state);
    const [data, setData] = useState<T[]>([])

    useEffect(() => {
        let evaluatedData = databaseData[resource] as any as T[]
        if (filterFunc) {
            evaluatedData = evaluatedData.filter(filterFunc)
        }
        setData(evaluatedData)
    }, [resource, filterFunc])

    return <Form.Item
        rules={[{ required: true, message: "Inserire il dato" }]}
        {...props}
        label={inputLabel}
        name={name}
    >
        <Row className='w-100'>
            <Col span={onAddClick ? 21 : 24}>
                <Select
                    options={data.map(v => ({
                        label: v[selectLabel as keyof typeof v],
                        value: v.id
                    }))}
                    filterOption={(input, option) =>
                        ((option?.label as any).toString() ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    allowClear={allowClear}
                    showSearch
                />
            </Col>
            {onAddClick && <Col span={2}>
                <Button type="primary" icon={<PlusOutlined />} onClick={onAddClick} />
            </Col>}
        </Row>

    </Form.Item>
}