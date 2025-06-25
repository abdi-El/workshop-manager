import { Button, Form, Input, InputNumber } from "antd";
import React, { useEffect } from "react";
import { create, update } from "../../database";
import { useStore } from "../../state";
import { Workshop } from "../../types/database";



type WorkshopFormProps = {
    workshop?: Partial<Workshop>;
    onSubmit: (values: Omit<Workshop, 'id'>) => void;
};

const WorkshopForm: React.FC<WorkshopFormProps> = ({ workshop = {}, onSubmit }) => {
    const [form] = Form.useForm();
    const { updateDatabaseData } = useStore((state) => state);


    const handleFinish = (values: Workshop) => {
        if (!workshop.id) {

            create(values, () => {
                form.resetFields();
                updateDatabaseData(["workshops"]);
                onSubmit(values);
            }, "workshops")
        }
        else {
            update(values, workshop.id, () => {
                form.resetFields();
                updateDatabaseData(["workshops"]);
                onSubmit(values);
            }, "workshops")
        }
    }


    useEffect(() => {
        if (workshop.id) {
            form.setFieldsValue(workshop);
        }
        else {
            form.resetFields();
        }
    }, [workshop, form]);



    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
        >
            <Form.Item
                label="Nome Officina"
                name="name"
                rules={[{ required: true, message: "Inserire nome" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Indirizzo"
                name="address"
                rules={[{ required: true, message: "Insirire indirizzo" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Numero di Partita IVA"
                name="vat_number"
                rules={[{ required: true, message: "Insirire numero partita iva" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Telefono"
                name="phone"
                rules={[{ required: true, message: "Inserire numero di telefono" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: "Inserire Email" },
                    { type: "email", message: "Inserire Email valida" },
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Prezzo Mano d'Opera Base"
                name="base_labor_cost"
                rules={[{ required: true, message: "Inserire prezzo base mano d'opera" }]}
            >
                <InputNumber min={0} style={{ width: "100%" }} prefix="€ " />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    {workshop ? "Aggiorna" : "Crea"} Officina
                </Button>
            </Form.Item>
        </Form>
    );
};

export default WorkshopForm;
