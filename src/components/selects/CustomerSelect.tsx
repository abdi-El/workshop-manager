import { Form, Select } from "antd";
import { useDatabaseStore } from "../../modules/state";

export default function CustomerSelect() {
    const { customers } = useDatabaseStore((state) => state);
    return <Form.Item
        label="Cliente"
        name="customer_id"
        rules={[{ required: true, message: "Inserire il  cliente" }]}
    >
        <Select options={customers.map(customer => ({
            label: customer.name,
            value: customer.id
        }))}>
        </Select>
    </Form.Item>
}