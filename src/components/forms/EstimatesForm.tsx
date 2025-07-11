import { Button, DatePicker, Form, InputNumber, Row, Switch } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { createOrUpdateEstimate, getEstimateItems } from "../../modules/database";
import { DATE_FORMAT } from "../../modules/dates";
import { useDatabaseStore, useStore } from "../../modules/state";
import { Estimate } from "../../types/database";
import CarSelect from "../selects/CarSelect";
import CustomerSelect from "../selects/CustomerSelect";
import EstimateItemsForm from "./EstimateItemsForm";

interface EstimatesFormProps {
    estimate?: Partial<Estimate>;
    onSubmit: (values: Omit<Estimate, "id">) => void;
};

export default function EstimatesForm({ estimate, onSubmit }: EstimatesFormProps) {
    const [form] = Form.useForm();
    const { updateDatabaseData } = useDatabaseStore((state) => state)
    const { settings } = useStore((state) => state);
    const customer_id = Form.useWatch("customer_id", form)

    const handleFinish = (values: Omit<Estimate, "id">) => {
        values.date = dayjs(values.date).format(DATE_FORMAT);
        values.workshop_id = settings?.selectedWorkshop?.id as number;
        const { items, ...rest } = values as any;
        createOrUpdateEstimate(rest as any, items, () => {
            form.resetFields();
            updateDatabaseData(["estimates"]);
            onSubmit(values);
        }, estimate?.id);
    };
    async function getItems() {
        if (estimate?.id) {
            form.setFieldValue("items", await getEstimateItems(estimate.id));
        }
    }

    useEffect(() => {
        if (!estimate) {
            form.resetFields()
            form.setFieldsValue({ date: dayjs(), labor_hourly_cost: settings.selectedWorkshop?.base_labor_cost, has_iva: true, items: [{}] })
        } else {
            form.setFieldsValue({
                ...estimate,
                date: dayjs(estimate.date, DATE_FORMAT),
            });
            getItems()
        }
    }, [estimate])


    useEffect(() => {
        if (estimate && estimate.customer_id == customer_id) {
            form.setFieldValue("car_id", estimate.car_id)
        } else {
            form.setFieldValue("car_id", undefined)
        }

    }, [customer_id])

    return (
        <Form form={form} layout="vertical" onFinish={handleFinish} className="estimates-form">
            <CustomerSelect />
            <Form.Item
                label="data"
                name="date"
                rules={[{ required: true, message: "Inserire la data" }]}
            >
                <DatePicker format={DATE_FORMAT} className="w-100" />
            </Form.Item>
            <Row >
                <CarSelect className="w-50" />
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
