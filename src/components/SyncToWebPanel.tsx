import { Button, Typography, message } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { exportAllData } from '../modules/export';

export default function SyncToWebPanel() {
    async function handleExportJson() {
        try {
            const path = await save({
                filters: [{ name: 'JSON', extensions: ['json'] }],
                defaultPath: 'gestionale-officina-export.json',
            });
            if (!path) return;
            const data = await exportAllData();
            const bytes = new TextEncoder().encode(JSON.stringify(data, null, 2));
            await writeFile(path, bytes);
            message.success('Dati esportati con successo');
        } catch (err: any) {
            message.error(`Errore durante l'esportazione: ${err?.message ?? err}`);
        }
    }

    return (
        <>
            <Typography.Paragraph style={{ marginTop: 0 }}>
                Esporta tutti i dati locali (officine, clienti, auto, preventivi, voci predefinite) come file JSON.
                Potrai poi importare il file nella versione web.
            </Typography.Paragraph>
            <Button type="primary" icon={<ExportOutlined />} onClick={handleExportJson}>
                Esporta come file JSON
            </Button>
        </>
    );
}
