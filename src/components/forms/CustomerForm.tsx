import { Button, Form, Input, message } from "antd";
import React, { useEffect } from "react";
import { api } from "../../modules/api";
import { useStore } from "../../modules/state";
import { parseError } from "../../modules/utils";
import { Customer } from "../../types/database";

type CustomerFormProps = {
    customer?: Partial<Customer>;
    onSubmit: (values: Omit<Customer, "id">) => void;
};

const CustomerForm: React.FC<CustomerFormProps> = ({ customer = {}, onSubmit }) => {
    const [form] = Form.useForm();
    const { settings } = useStore((state) => state);
    const handleFinish = (values: Omit<Customer, "id">) => {
        function onError(error: string) {
            form.setFields(parseError(error));
        }
        if (!customer.id) {
            api.createCustomer({ ...values, "workshop_id": settings.selectedWorkshop?.id }).then(() => {
                message.success("Creato con successo!");
                form.resetFields();
                onSubmit(values);
            }).catch(onError);
        } else {
            api.updateCustomer(customer.id, values).then(() => {
                message.success("Aggiornato con successo!");
                form.resetFields();
                onSubmit(values);
            }).catch(onError)
        }
    };

    useEffect(() => {
        if (customer.id) {
            form.setFieldsValue(customer);
        } else {
            form.resetFields();
        }
    }, [customer, form]);

    return (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Form.Item
                label="Nome Cliente"
                name="name"
                rules={[{ required: true, message: "Inserire il nome del cliente" }]}
            >
                <Input spellCheck lang="it" />
            </Form.Item>

            <Form.Item
                label="Indirizzo"
                name="address"
            >
                <Input spellCheck lang="it" />
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
                rules={[{ type: "email", message: "Inserire un'email valida" }]}
            >
                <Input spellCheck={false} />
            </Form.Item>

            <Form.Item
                label="Note"
                name="notes"
            >
                <Input.TextArea rows={3} spellCheck lang="it" />
            </Form.Item>


            <Form.Item>
                <Button type="primary" htmlType="submit">
                    {customer?.id ? "Aggiorna" : "Crea"} Cliente
                </Button>
            </Form.Item>
        </Form>
    );
};

export default CustomerForm;
