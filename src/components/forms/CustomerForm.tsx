import { Button, Form, Input, message } from "antd";
import React, { useEffect } from "react";
import { create, update } from "../../modules/database";
import { useDatabaseStore, useStore } from "../../modules/state";
import { Customer } from "../../types/database";

type CustomerFormProps = {
    customer?: Partial<Customer>;
    onSubmit: (values: Omit<Customer, "id">) => void;
};

const CustomerForm: React.FC<CustomerFormProps> = ({ customer = {}, onSubmit }) => {
    const [form] = Form.useForm();
    const { updateDatabaseData } = useDatabaseStore((state) => state)
    const { settings } = useStore((state) => state);
    const handleFinish = (values: Omit<Customer, "id">) => {
        if (!customer.id) {
            create({ ...values, "workshop_id": settings.selectedWorkshop?.id }, () => {
                form.resetFields();
                updateDatabaseData(["customers"]);
                onSubmit(values);
            }, "customers");
        } else {
            update(values, customer.id, "customers").then(() => {
                form.resetFields();
                updateDatabaseData(["customers"]);
                onSubmit(values);
            }).catch(err => message.error("Errore durante l'aggiornamento del cliente: " + err));
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
                <Input />
            </Form.Item>

            <Form.Item
                label="Indirizzo"
                name="address"
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
                rules={[{ type: "email", message: "Inserire un'email valida" }]}
            >
                <Input />
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
