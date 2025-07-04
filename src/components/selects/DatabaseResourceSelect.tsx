import { Form, Select } from "antd";
import { DatabaseState, useDatabaseStore } from "../../modules/state";


type Resource = Exclude<keyof DatabaseState, "databaseLoading" | "updateDatabaseData">
export interface DatabaseSelectProps extends React.ComponentProps<typeof Form.Item> {
    resource: Resource
    selectLabel: string
    name: string
    inputLabel: string
    allowClear?: boolean
}

export default function DatabasResourceSelect({ resource, selectLabel, name, inputLabel, allowClear, ...props }: DatabaseSelectProps) {
    const data = useDatabaseStore((state) => state);
    return <Form.Item
        {...props}
        label={inputLabel}
        name={name}
        rules={[{ required: true, message: "Inserire il  cliente" }]}
    >
        <Select options={data[resource].map(v => ({
            label: v[selectLabel as keyof typeof v],
            value: v.id
        }))} allowClear={allowClear}>
        </Select>
    </Form.Item>
}