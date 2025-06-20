import { Button, Form, Input, InputNumber, message } from "antd";
import React from "react";
import { db } from "../../database";
import { useStore } from "../../state";
import { Workshop } from "../../types/database";



type WorkshopFormProps = {
    workshop?: Partial<Workshop>;
    onSubmit: (values: Omit<Workshop, 'id'>) => void;
};

const WorkshopForm: React.FC<WorkshopFormProps> = ({ workshop = {}, onSubmit }) => {
    const [form] = Form.useForm();
    const { updateWorkshops } = useStore((state) => state);


    const handleFinish = (values: Workshop) => {
        db.execute(`
            INSERT INTO workshops (${Object.keys(values).join(", ")})
            VALUES (${Object.keys(values).map((_, index) => `$${index + 1}`).join(", ")})
        `, Object.values(values)).then(() => {
            form.resetFields();
            message.success("Officina creata con successo!");
            updateWorkshops();
            onSubmit(values);
        }).catch((error) => {
            message.error("Errore nella crezione dell'officina : " + error);
        });
        onSubmit(values);
    };




    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={workshop}
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
                    Crea Officina
                </Button>
            </Form.Item>
        </Form>
    );
};

export default WorkshopForm;
