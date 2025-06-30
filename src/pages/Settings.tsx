import { Button, Form, Layout, message, Select } from 'antd';
import { useEffect } from 'react';
import MakersModels from '../components/MakersModels';
import { storeSettings } from '../modules/database';
import { useStore } from '../modules/state';
import { SettingsType } from '../types/common';



export default function Settings() {
    const { settings, updateSettings } = useStore((state) => state)

    const [form] = Form.useForm<SettingsType>()

    useEffect(() => {
        form.setFieldsValue(settings);
    }, [])

    return (
        <Layout>
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
            <MakersModels />
            <Button onClick={() => storeSettings.clear()} >RESET IMPOSTAZIONI</Button>

        </Layout>
    );
}