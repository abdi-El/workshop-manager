import { Form, Select } from "antd";
import { DatabaseState, useDatabaseStore } from "../../modules/state";


type Resource = Exclude<keyof DatabaseState, "databaseLoading" | "updateDatabaseData">
interface Props {
    resource: Resource // Exclude 'databaseLoading' as it is not a resource
    selectLabel: string
    name: string // Optional name prop for Form.Item
    inputLabel: string // Optional label for the input
}

export default function DatabasResourceSelect(props: Props) {
    const data = useDatabaseStore((state) => state);
    return <Form.Item
        label={props.inputLabel}
        name={props.name}
        rules={[{ required: true, message: "Inserire il  cliente" }]}
    >
        <Select options={data[props.resource].map(v => ({
            label: v[props.selectLabel as keyof typeof v],
            value: v.id
        }))}>
        </Select>
    </Form.Item>
}