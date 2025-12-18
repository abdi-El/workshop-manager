import { createClient } from '@supabase/supabase-js';
import { BaseDirectory, readFile } from '@tauri-apps/plugin-fs';
import { Button, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { useStore } from "../modules/state";



export default function BackupManager() {
    const { settings, updateSettings, setSupabaseClient, supabaseClient } = useStore((state) => state)
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    useEffect(() => {
        setLoading(true)
        form.setFieldsValue(settings.supabase)
        if (settings.supabase && !supabaseClient) {
            setSupabaseClient(createClient(settings.supabase.supabaseUrl, settings.supabase.supabaseKey))
        }
        setLoading(false)

    }, [settings.supabase])



    return (
        <div>
            <Form form={form} layout="inline" onFinish={(values) => {
                updateSettings({ supabase: values })
                setSupabaseClient(createClient(values.supabaseUrl, values.supabaseKey))
            }}>
                <Form.Item label="URL Supabase" name="supabaseUrl">
                    <Input placeholder='supabaseUrl' />
                </Form.Item>
                <Form.Item label="Chiave Supabase" name="supabaseKey">
                    <Input placeholder='supabaseKey' />
                </Form.Item>
                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Connetti
                    </Button>
                </Form.Item>
            </Form>
            <Button
                loading={loading}
                disabled={!supabaseClient} style={{ width: "100%", marginTop: "10px", backgroundColor: "#347911ff" }} onClick={(e) => {
                    setLoading(true);
                    e.stopPropagation();
                    if (supabaseClient) {
                        readFile("estimates.db", {
                            baseDir: BaseDirectory.AppConfig,
                        }).then((file) => {
                            const now = new Date();
                            const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
                            supabaseClient.storage.from('backups').upload(`dbs/estimates_${formattedDate}.db`, file, { upsert: true }).then(({ error }) => {
                                if (error) {
                                    throw error;
                                } else {
                                    message.success('Backup eseguito con successo!');
                                }
                            })
                        }).finally(() => setLoading(false));
                    }
                }} >
                Esegui Backup
            </Button>
        </div>
    )
}