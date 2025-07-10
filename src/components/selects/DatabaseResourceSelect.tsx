import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Row, Select, Tooltip } from "antd";
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

export default function DatabasResourceSelect<T extends { id: number }>({ resource, selectLabel, name, inputLabel, allowClear, filterFunc, onAddClick, className, ...props }: DatabaseSelectProps) {
    const databaseData = useDatabaseStore((state) => state);
    const [data, setData] = useState<T[]>([])

    useEffect(() => {
        let evaluatedData = databaseData[resource] as any as T[]
        if (filterFunc) {
            evaluatedData = evaluatedData.filter(filterFunc)
        }
        setData(evaluatedData)
    }, [resource, filterFunc, databaseData[resource]])


    return <Row className={className} justify={"start"}>
        <Col span={onAddClick ? 21 : 24} style={{ marginRight: onAddClick ? 3 : 0 }}>
            <Form.Item
                rules={[{ required: true, message: "Inserire il dato" }]}
                {...props}
                label={inputLabel}
                name={name}
            >
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
            </Form.Item>
        </Col>
        {onAddClick && <Col span={2} style={{ display: "flex", alignItems: "center" }} >
            <Tooltip title={"Crea " + inputLabel}>
                <Button type="primary" icon={<PlusOutlined />} onClick={onAddClick} style={{ height: "30px", width: "30px", marginTop: "5px" }} />
            </Tooltip>
        </Col>}
    </Row>
}