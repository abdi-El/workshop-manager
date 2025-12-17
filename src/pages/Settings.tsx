import { Button, Divider, Form, Layout, message, Select } from 'antd';
import { useEffect } from 'react';
import BackupManager from '../components/BackupManager';
import MakersModelsImporter from '../components/MakersModelsImporter';
import { storeSettings } from '../modules/database';
import { useStore } from '../modules/state';
import { SettingsType } from '../types/common';


export default function Settings() {
    const { settings, updateSettings, isDebug } = useStore((state) => state)

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
            <Divider />
            <BackupManager />
            <Divider />
            <MakersModelsImporter />
            {isDebug &&
                <div>
                    <Button style={{ width: "100%" }} onClick={
                        () => {
                            storeSettings.reset().then(() => {
                                updateSettings()
                            })
                        }
                    }>RESET STORE</Button>
                </div>
            }
        </Layout>
    );
}