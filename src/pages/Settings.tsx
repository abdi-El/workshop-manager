import {
    BgColorsOutlined, DatabaseOutlined, FilePdfOutlined,
    LineChartOutlined, MobileOutlined, ToolOutlined
} from '@ant-design/icons';
import { Button, Card, Collapse, Flex, Popconfirm, QRCode, Segmented, Space, Switch, Typography } from 'antd';
import { ReactNode, useEffect, useState } from 'react';
import DefaultEstimateItems from '../components/DefaultEstimateItems';
import MakersModelsImporter from '../components/MakersModelsImporter';
import themes from "../components/pdf/themes.json";
import ThemeSelector from '../components/pdf/ThemeSelector';
import { useIsMobile } from '../modules/hooks';
import { useStore } from '../modules/state';
import { storeSettings } from '../modules/store';
import { isTauri } from '../modules/utils';

const { Text } = Typography;

/** A labelled setting row: title + optional description on the left, control on the right.
 *  Wraps and stacks on narrow screens. */
function SettingRow({ title, description, control }: { title: string; description?: string; control: ReactNode }) {
    return (
        <Flex justify="space-between" align="center" gap={12} wrap style={{ padding: '6px 0' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
                <div>{title}</div>
                {description && <Text type="secondary" style={{ fontSize: 12 }}>{description}</Text>}
            </div>
            <div>{control}</div>
        </Flex>
    );
}

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
    return <Space>{icon}{children}</Space>;
}

export default function Settings() {
    const { settings, updateSettings, isDebug } = useStore((state) => state);
    const isMobile = useIsMobile();
    const [lanUrl, setLanUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!isTauri()) return;
        fetch("http://localhost:3333/api/lan-url")
            .then(r => r.json())
            .then(data => setLanUrl(data.url))
            .catch(() => { });
    }, []);

    return (
        <div style={{ maxWidth: 820, width: '100%', margin: '0 auto' }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card size="small" title={<SectionTitle icon={<BgColorsOutlined />}>Aspetto</SectionTitle>}>
                    <SettingRow
                        title="Tema applicazione"
                        description="Aspetto chiaro o scuro dell'interfaccia"
                        control={
                            <Segmented
                                value={settings.theme}
                                onChange={(value) => updateSettings({ theme: value as string })}
                                options={[
                                    { label: 'Chiaro', value: 'light' },
                                    { label: 'Scuro', value: 'dark' },
                                ]}
                            />
                        }
                    />
                </Card>

                <Card size="small" title={<SectionTitle icon={<LineChartOutlined />}>Dashboard</SectionTitle>}>
                    <SettingRow
                        title="Statistiche di fatturato"
                        description="Mostra i dati economici nella dashboard"
                        control={
                            <Switch
                                checked={settings.showRevenueStatistics}
                                onChange={(checked) => updateSettings({ showRevenueStatistics: checked })}
                            />
                        }
                    />
                </Card>

                <Card size="small" title={<SectionTitle icon={<FilePdfOutlined />}>Preventivo PDF</SectionTitle>}>
                    <SettingRow
                        title="Numero preventivo"
                        description="Includi il numero progressivo nel PDF"
                        control={
                            <Switch
                                checked={settings.showPdfNumber}
                                onChange={(checked) => updateSettings({ showPdfNumber: checked })}
                            />
                        }
                    />
                    <div style={{ marginTop: 12 }}>
                        <Text strong>Tema PDF</Text>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                            Attuale: {themes[settings.pdfTheme as keyof typeof themes].name}
                        </Text>
                        <ThemeSelector />
                    </div>
                </Card>

                <Card size="small" title={<SectionTitle icon={<DatabaseOutlined />}>Anagrafiche e dati</SectionTitle>}>
                    <Collapse
                        items={[
                            { key: 'items', label: 'Voci di default', children: <DefaultEstimateItems /> },
                            { key: 'makers', label: 'Importa marche e modelli', children: <MakersModelsImporter /> },
                        ]}
                    />
                </Card>

                {isTauri() && lanUrl && (
                    <Card size="small" title={<SectionTitle icon={<MobileOutlined />}>Accesso mobile</SectionTitle>}>
                        <Flex vertical align="center" gap={16}>
                            <QRCode value={lanUrl} size={isMobile ? 160 : 200} />
                            <Text copyable>{lanUrl}</Text>
                            <Text type="secondary" style={{ textAlign: 'center' }}>
                                Scansiona il QR dal telefono per accedere all'app sulla stessa rete
                            </Text>
                        </Flex>
                    </Card>
                )}

                {isDebug && (
                    <Card size="small" title={<SectionTitle icon={<ToolOutlined />}>Avanzate</SectionTitle>}>
                        <Popconfirm
                            title="Reimpostare le impostazioni?"
                            description="Tutte le preferenze verranno azzerate."
                            okText="Reimposta"
                            cancelText="Annulla"
                            okButtonProps={{ danger: true }}
                            onConfirm={() => storeSettings.reset().then(() => updateSettings())}
                        >
                            <Button danger block>Reset impostazioni</Button>
                        </Popconfirm>
                    </Card>
                )}
            </Space>
        </div>
    );
}
