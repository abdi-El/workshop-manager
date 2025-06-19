import { load } from '@tauri-apps/plugin-store';
import { Button, Form, message, Select } from 'antd';
import { useEffect } from 'react';
const store = await load('settings.json', { autoSave: false });
interface SettingsType {
    theme: string;
}


export default function Settings() {
    const [form] = Form.useForm<SettingsType>()

    async function getSettings() {
        store.get('settings').then(settings => {
            if (!settings) {
                // Initialize default settings if not present
                const defaultValue = { theme: 'light' };
                // Initialize default settings if not present
                store.set('settings', defaultValue);
                form.setFieldsValue(defaultValue);
            }
            else {
                form.setFieldsValue(settings as SettingsType);
            }
        });
    }
    useEffect(() => {
        getSettings()
    }, [])



    return (
        <div className="settings">
            <h1>Settings</h1>
            <Form form={form} layout="vertical" className="settings-form">
                <Form.Item label="Theme" name="theme">
                    <Select>
                        <Select.Option value="light">Chiaro</Select.Option>
                        <Select.Option value="dark">Scuro</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={() => {
                        form.validateFields().then(values => {
                            store.set('settings', values).then(() => {
                                message.success('Impostazioni salvate con successo!');
                            }).catch(err => {
                                message.error('Errore durante il salvataggio delle impostazioni.');
                            });
                        }).catch(err => {
                            message.error('Errore di validazione: ' + err);
                        });
                    }} >
                        Salva Impostazioni
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}