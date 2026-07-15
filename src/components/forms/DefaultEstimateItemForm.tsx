import { Button, Form, Input, InputNumber, message } from "antd";
import { useEffect } from "react";
import { getDb } from "../../modules/db/instance";
import { parseError } from "../../modules/utils";
import { EstimateDefaultItem } from "../../types/database";

interface DefaultEstimateItemFormProps {
    item?: EstimateDefaultItem
    onSubmit: (values: Omit<EstimateDefaultItem, "id">) => void;
}

export default function DefaultEstimateItemForm({ item, onSubmit }: DefaultEstimateItemFormProps) {
    const [form] = Form.useForm();

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
            getDb().create(values, "default_estimate_items").then(() => {
                message.success("Creato con successo!");
                form.resetFields();
                onSubmit(values);
            }).catch(onError);
        } else {
            getDb().update(values, item.id, "default_estimate_items").then(() => {
                message.success("Aggiornato con successo!");
                form.resetFields();
                onSubmit(values);
            }).catch(onError);
        }
    };

    return <Form form={form} layout="inline" onFinish={handleFinish}>
        <Form.Item label="Descrizione" name="description">
            <Input spellCheck lang="it" />
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


