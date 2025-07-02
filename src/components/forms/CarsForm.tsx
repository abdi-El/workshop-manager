import { Button, Form, Input, InputNumber } from "antd";
import { useEffect } from "react";
import { create, update } from "../../modules/database";
import { useDatabaseStore, useStore } from "../../modules/state";
import { Car } from "../../types/database";
import DatabasResourceSelect from "../selects/DatabaseResourceSelect";

type CarFormProps = {
    car?: Partial<Car>;
    onSubmit: (values: Omit<Car, "id">) => void;
};

export default function CarsForm({ car = {}, onSubmit }: CarFormProps) {
    const [form] = Form.useForm();
    const { updateDatabaseData } = useDatabaseStore((state) => state)

    const { settings } = useStore((state) => state);

    const handleFinish = (values: Omit<Car, "id">) => {
        if (!car.id) {
            create({ ...values, "workshop_id": settings.selectedWorkshop?.id }, () => {
                form.resetFields();
                updateDatabaseData(["cars"]);
                onSubmit(values);
            }, "cars");
        } else {
            update(values, car.id, () => {
                form.resetFields();
                updateDatabaseData(["cars"]);
                onSubmit(values);
            }, "cars");
        }
    };

    useEffect(() => {
        if (car.id) {
            form.setFieldsValue(car);
        } else {
            form.resetFields();
        }
    }, [car, form]);

    return (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
            <DatabasResourceSelect resource="customers" selectLabel="name" name="customer_id" inputLabel="Cliente" />
            <DatabasResourceSelect resource="makers" selectLabel="name" name="maker_id" inputLabel="Marca" />
            <DatabasResourceSelect resource="models" selectLabel="name" name="model_id" inputLabel="Modello" />
            <Form.Item
                label="Anno"
                name="year"
                rules={[{ required: true, message: "Inserire il l'anno" }]}
            >
                <InputNumber />
            </Form.Item>
            <Form.Item
                label="Targa"
                name="number_plate"
                rules={[{ required: true, message: "Inserire la targa" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    {car?.id ? "Aggiorna" : "Crea"} Auto
                </Button>
            </Form.Item>
        </Form>
    );
};

