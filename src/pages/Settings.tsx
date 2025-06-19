import { Button, Form, message, Select, Typography } from 'antd';
import { useEffect } from 'react';
import { useStore } from '../state';
import { SettingsType } from '../types/common';

const { Title } = Typography;
export default function Settings() {
    const { settings, setSettings } = useStore((state) => state)
    const [form] = Form.useForm<SettingsType>()

    useEffect(() => {
        form.setFieldsValue(settings);
    }, [])

    return (
        <>
            <Title level={2}>Impostazioni</Title>
            <Form form={form} layout="vertical" className="settings-form">
                <Form.Item label="Selezionare il tema:" name="theme">
                    <Select>
                        <Select.Option value="light">Chiaro</Select.Option>
                        <Select.Option value="dark">Scuro</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={() => {
                        form.validateFields().then(values => {
                            setSettings(values);
                            message.success('Impostazioni salvate con successo!');
                        }).catch(err => {
                            message.error('Errore di validazione: ' + err);
                        });
                    }} >
                        Salva Impostazioni
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}