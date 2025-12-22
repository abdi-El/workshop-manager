import { Button, Form, Input, InputNumber } from "antd";
import { useEffect } from "react";
import { create, update, } from "../../modules/database";
import { useDatabaseStore } from "../../modules/state";
import { parseError } from "../../modules/utils";
import { EstimateDefaultItem } from "../../types/database";

interface DefaultEstimateItemFormProps {
    item?: EstimateDefaultItem
    onSubmit: (values: Omit<EstimateDefaultItem, "id">) => void;
}

export default function DefaultEstimateItemForm({ item, onSubmit }: DefaultEstimateItemFormProps) {
    const [form] = Form.useForm();
    const { updateDatabaseData } = useDatabaseStore((state) => state)

    useEffect(() => {
        if (item) {
            form.setFieldsValue(item);
        }
    }, [item])

    const handleFinish = (values: Omit<EstimateDefaultItem, "id">) => {
        function onError(error: string) {
            form.setFields(parseError(error));
        }
        if (!item) {
            create(values, "default_estimate_items").then(() => {
                form.resetFields();
                updateDatabaseData(["default_estimate_items"]);
                onSubmit(values);
            }).catch(onError);
        } else {
            update(values, item.id, "default_estimate_items").then(() => {
                form.resetFields();
                updateDatabaseData(["default_estimate_items"]);
                onSubmit(values);
            }).catch(onError);
        }
    };

    return <Form form={form} layout="inline" onFinish={handleFinish}>
        <Form.Item label="Descrizione" name="description">
            <Input />
        </Form.Item>
        <Form.Item label="Prezzo Unitario" name="unit_price">
            <InputNumber />
        </Form.Item>
        <Form.Item>
            <Button htmlType="submit" type="primary" >
                {item ? "Aggiorna" : "Crea"}
            </Button>
        </Form.Item>
    </Form>
}


