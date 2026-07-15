import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Row, Select, Tooltip } from "antd";
import { useEffect, useMemo } from "react";
import { getDb } from "../../modules/db/instance";
import { useQuery } from "../../modules/hooks";

const resourceMethods = {
    customers: () => getDb().getCustomers(),
    makers: () => getDb().getMakers(),
    models: () => getDb().getModels(),
    cars: () => getDb().getCars(),
    estimates: () => getDb().getEstimates(),
} as const;

type Resource = keyof typeof resourceMethods

export interface DatabaseSelectProps extends React.ComponentProps<typeof Form.Item> {
    resource: Resource
    selectLabel: string
    name: string
    inputLabel: string
    allowClear?: boolean
    filterFunc?: (el: any) => boolean
    onAddClick?: () => void
    refreshToken?: number
}

export default function DatabasResourceSelect<T extends { id: number }>({ resource, selectLabel, name, inputLabel, allowClear, filterFunc, onAddClick, refreshToken, className, ...props }: DatabaseSelectProps) {
    const { data: rows, loading, reload } = useQuery<T>(() => resourceMethods[resource]() as unknown as Promise<T[]>);

    useEffect(() => {
        if (refreshToken) {
            reload();
        }
    }, [refreshToken]);

    const data = useMemo(() => {
        return filterFunc ? rows.filter(filterFunc) : rows;
    }, [rows, filterFunc]);

    return <Row className={className} justify={"start"}>
        <Col span={onAddClick ? 21 : 24} style={{ marginRight: onAddClick ? 3 : 0 }}>
            <Form.Item
                rules={[{ required: true, message: "Inserire il dato" }]}
                {...props}
                label={inputLabel}
                name={name}
            >
                <Select
                    loading={loading}
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
