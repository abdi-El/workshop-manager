import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Row, Select, Tooltip } from "antd";
import { useEffect, useMemo } from "react";
import { api } from "../../modules/api";
import { useQuery } from "../../modules/hooks";
import { useStore } from "../../modules/state";

type Resource = "customers" | "makers" | "models" | "cars" | "estimates";

function getResourceFetcher(resource: Resource, workshopId?: number) {
    switch (resource) {
        case "customers": return () => api.getCustomers(workshopId);
        case "cars": return () => api.getCars(workshopId);
        case "estimates": return () => api.getEstimates(workshopId);
        case "makers": return () => api.getMakers();
        case "models": return () => api.getModels();
    }
}

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
    const { settings } = useStore((state) => state);
    const workshopId = settings.selectedWorkshop?.id;
    const { data: rows, loading, reload } = useQuery<T>(() => getResourceFetcher(resource, workshopId)() as unknown as Promise<T[]>, [workshopId]);

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
