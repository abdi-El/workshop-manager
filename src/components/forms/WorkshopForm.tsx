import { Button, Form, Input, InputNumber, message } from "antd";
import React, { useEffect } from "react";
import { getDb } from "../../modules/db/instance";
import { Workshop } from "../../types/database";



type WorkshopFormProps = {
    workshop?: Partial<Workshop>;
    onSubmit: (values: Omit<Workshop, 'id'>) => void;
};

const WorkshopForm: React.FC<WorkshopFormProps> = ({ workshop = {}, onSubmit }) => {
    const [form] = Form.useForm();

    const handleFinish = (values: Workshop) => {
        if (!workshop.id) {
            getDb().create(values, "workshops").then(() => {
                message.success("Creato con successo!");
                form.resetFields();
                onSubmit(values);
            })
        }
        else {
            getDb().update(values, workshop.id, "workshops").then(() => {
                message.success("Aggiornato con successo!");
                form.resetFields();
                onSubmit(values);
            })
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
            id="WorkshopForm"
        >
            <Form.Item
                label="Nome Officina"
                name="name"
                rules={[{ required: true, message: "Inserire nome" }]}
            >
                <Input spellCheck lang="it" />
            </Form.Item>

            <Form.Item
                label="Indirizzo"
                name="address"
                rules={[{ required: true, message: "Insirire indirizzo" }]}
            >
                <Input spellCheck lang="it" />
            </Form.Item>

            <Form.Item
                label="Numero di Partita IVA"
                name="vat_number"
                rules={[{ required: true, message: "Insirire numero partita iva" }]}
            >
                <Input spellCheck={false} />
            </Form.Item>

            <Form.Item
                label="Telefono"
                name="phone"
                rules={[{ required: true, message: "Inserire numero di telefono" }]}
            >
                <Input spellCheck={false} />
            </Form.Item>

            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: "Inserire Email" },
                    { type: "email", message: "Inserire Email valida" },
                ]}
            >
                <Input spellCheck={false} />
            </Form.Item>

            <Form.Item
                label="Prezzo Mano d'Opera Base"
                name="base_labor_cost"
                rules={[{ required: true, message: "Inserire prezzo base mano d'opera" }]}
            >
                <InputNumber min={0} style={{ width: "100%" }} prefix="€ " />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" id="WorkshopFormSubmit">
                    {workshop?.id ? "Aggiorna" : "Crea"} Officina
                </Button>
            </Form.Item>
        </Form>
    );
};

export default WorkshopForm;
