import { Button, Form, Input, InputNumber } from "antd";
import React from "react";
import { Workshop } from "../../types/database";



type WorkshopFormProps = {
    workshop?: Partial<Workshop>;
    onSubmit: (values: Omit<Workshop, 'id'>) => void;
};

const WorkshopForm: React.FC<WorkshopFormProps> = ({ workshop = {}, onSubmit }) => {
    const [form] = Form.useForm();

    const handleFinish = (values: any) => {
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
                label="Workshop Name"
                name="name"
                rules={[{ required: true, message: "Please enter the workshop name" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: "Please enter the address" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="VAT Number"
                name="vat_number"
                rules={[{ required: true, message: "Please enter the VAT number" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true, message: "Please enter the phone number" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: "Please enter the email" },
                    { type: "email", message: "Please enter a valid email" },
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Base Labor Cost"
                name="base_labor_cost"
                rules={[{ required: true, message: "Please enter the base labor cost" }]}
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
