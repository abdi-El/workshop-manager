import { Form, Select } from "antd";
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
}

export default function DatabasResourceSelect<T extends { id: number }>({ resource, selectLabel, name, inputLabel, allowClear, filterFunc, ...props }: DatabaseSelectProps) {
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
        {...props}
        label={inputLabel}
        name={name}
        rules={[{ required: true, message: "Inserire il  cliente" }]}
    >
        <Select
            options={data.map(v => ({
                label: v[selectLabel as keyof typeof v],
                value: v.id
            }))} allowClear={allowClear}
            showSearch
            filterOption={(input, option) =>
                ((option?.label as any).toString() ?? '').toLowerCase().includes(input.toLowerCase())
            }
        >
        </Select>
    </Form.Item>
}