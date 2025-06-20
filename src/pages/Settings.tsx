import { Form, message, Select } from 'antd';
import { useEffect } from 'react';
import { useStore } from '../state';
import { SettingsType } from '../types/common';



export default function Settings() {
    const { settings, updateSettings } = useStore((state) => state)
    const [form] = Form.useForm<SettingsType>()

    useEffect(() => {
        form.setFieldsValue(settings);
    }, [])

    return (
        <>
            <Form form={form} layout="vertical" className="settings-form" onValuesChange={() => {
                form.validateFields().then((values) => updateSettings(values)).catch(err => {
                    message.error('Errore di validazione: ' + err);
                });
            }}>
                <Form.Item label="Selezionare il tema:" name="theme">
                    <Select>
                        <Select.Option value="light">Chiaro</Select.Option>
                        <Select.Option value="dark">Scuro</Select.Option>
                    </Select>
                </Form.Item>

            </Form>
        </>
    );
}