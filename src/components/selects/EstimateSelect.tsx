import { Form } from "antd";
import DatabasResourceSelect from "./DatabaseResourceSelect";

export default function EstimateSelect(props: React.ComponentProps<typeof Form.Item>) {
    return <DatabasResourceSelect
        {...props}
        resource="estimates"
        selectLabel="id"
        name="estimate_id"
        inputLabel="Preventivo"
        allowClear
    />
}