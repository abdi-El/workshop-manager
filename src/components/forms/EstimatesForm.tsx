import { Button, DatePicker, Form, InputNumber, Row, Switch } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { createOrUpdateEstimate, db } from "../../modules/database";
import { useDatabaseStore, useStore } from "../../modules/state";
import { Estimate } from "../../types/database";
import DatabasResourceSelect from "../selects/DatabaseResourceSelect";
import EstimateItemsForm from "./EstimateItemsForm";

interface EstimatesFormProps {
    estimate?: Partial<Estimate>;
    onSubmit: (values: Omit<Estimate, "id">) => void;
};

export default function EstimatesForm({ estimate = {}, onSubmit }: EstimatesFormProps) {
    const [form] = Form.useForm();
    const { updateDatabaseData } = useDatabaseStore((state) => state)
    const { settings } = useStore((state) => state);

    const handleFinish = (values: Omit<Estimate, "id">) => {
        values.date = dayjs(values.date).format("DD-MM-YYYY");
        values.workshop_id = settings?.selectedWorkshop as number;
        const { items, ...rest } = values as any;
        createOrUpdateEstimate(rest as any, items, () => {
            form.resetFields();
            updateDatabaseData(["estimates"]);
            onSubmit(values);
        }, estimate.id);
    };
    async function getItems() {
        if (estimate.id) {
            let result = await db.select(`SELECT * FROM estimate_items WHERE estimate_id = ${estimate.id}`);
            form.setFieldValue("items", result);
        }
    }

    useEffect(() => {
        if (estimate.id) {
            form.setFieldsValue({
                ...estimate,
                date: dayjs(estimate.date, "DD-MM-YYYY"),
            });
            getItems()
        } else {
            form.resetFields();
        }
    }, [estimate, form]);
    return (
        <Form form={form} layout="vertical" onFinish={handleFinish} className="estimates-form">
            <DatabasResourceSelect resource="customers" selectLabel="name" name="customer_id" inputLabel="Cliente" className="w-100" />
            <Form.Item
                label="data"
                name="date"
                rules={[{ required: true, message: "Inserire la data" }]}
            >
                <DatePicker format="DD/MM/YYYY" className="w-100" />
            </Form.Item>
            <Row >
                <DatabasResourceSelect resource="cars" selectLabel="id" name="car_id" inputLabel="Auto" className="w-50" />
                <Form.Item
                    className="w-50"
                    label="Km"
                    name="car_kms"
                    rules={[{ required: true, message: "Inserire il chilometraggio" }]}
                >
                    <InputNumber className="w-100" />
                </Form.Item>
            </Row>
            <Row>
                <Form.Item
                    label="Ore Lavoro"
                    name="labor_hours"
                    rules={[{ required: true, message: "Inserire le ore di lavoro" }]}
                    className="w-50"
                >
                    <InputNumber className="w-100" />
                </Form.Item>
                <Form.Item
                    label="Costo Orario"
                    name="labor_hourly_cost"
                    rules={[{ required: true, message: "Inserire costo orario" }]}
                    className="w-50"
                >
                    <InputNumber className="w-100" />
                </Form.Item>
            </Row>
            <EstimateItemsForm />
            <Row>
                <Form.Item
                    label="Sconto"
                    name="discount"
                    rules={[{ required: false }]}
                    className="w-50"
                >
                    <InputNumber className="w-100" />
                </Form.Item>
                <Form.Item
                    label="IVA"
                    name="has_iva"
                    valuePropName="checked"
                    rules={[{ required: true, message: "Selezionare se ha IVA" }]}
                    className="w-50"
                >
                    <Switch defaultChecked />
                </Form.Item>
            </Row>

            <Form.Item>
                <Button type="primary" htmlType="submit" className="w-100">
                    {estimate?.id ? "Aggiorna" : "Crea"} Preventivo
                </Button>
            </Form.Item>
        </Form>
    );
};
