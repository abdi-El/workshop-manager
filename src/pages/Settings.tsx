import {
    CalendarOutlined, CheckOutlined, CloseOutlined, DatabaseOutlined,
    EditOutlined, FilePdfOutlined, MobileOutlined, SettingOutlined, ToolOutlined
} from '@ant-design/icons';
import { Button, Card, Collapse, Flex, Input, InputNumber, Popconfirm, QRCode, Segmented, Space, Switch, Typography } from 'antd';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import DefaultEstimateItems from '../components/DefaultEstimateItems';
import MakersModelsImporter, { MakersCollapseLabel } from '../components/MakersModelsImporter';
import themes from "../components/pdf/themes.json";
import ThemeSelector from '../components/pdf/ThemeSelector';
import { api } from '../modules/api';
import { useIsMobile } from '../modules/hooks';
import { useStore } from '../modules/state';
import { isTauri } from '../modules/utils';

const { Text } = Typography;

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

function EditableCard({ title, icon, fields, onSave }: {
    title: string;
    icon: ReactNode;
    fields: (draft: Record<string, any>, setDraft: (k: string, v: any) => void, editing: boolean) => ReactNode;
    onSave: (values: Record<string, any>) => void;
}) {
    const { settings } = useStore(state => state);
    const [editing, setEditing] = useState(false);
    const [draft, setDraftState] = useState<Record<string, any>>({});

    const initial = useMemo(() => ({ ...settings }), [editing]);

    function startEdit() {
        setDraftState({ ...settings });
        setEditing(true);
    }

    function cancel() {
        setDraftState({});
        setEditing(false);
    }

    function save() {
        onSave(draft);
        setEditing(false);
    }

    function setDraft(k: string, v: any) {
        setDraftState(prev => ({ ...prev, [k]: v }));
    }

    const hasChanges = editing && Object.keys(draft).some(k => draft[k] !== (initial as any)[k]);

    return <Card size="small" title={<SectionTitle icon={icon}>{title}</SectionTitle>} extra={
        editing
            ? <Space size={4}>
                <Button size="small" icon={<CheckOutlined />} type="primary" disabled={!hasChanges} onClick={save}>Salva</Button>
                <Button size="small" icon={<CloseOutlined />} danger onClick={cancel}>Annulla</Button>
            </Space>
            : <Button size="small" icon={<EditOutlined />} type="primary" onClick={startEdit}>Modifica</Button>
    }>
        {fields(editing ? draft : settings as any, setDraft, editing)}
    </Card>;
}

export default function Settings() {
    const { settings, updateSettings, isDebug } = useStore((state) => state);
    const isMobile = useIsMobile();
    const [lanUrl, setLanUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!isTauri()) return;
        fetch("http://localhost:3333/api/lan-url")
            .then(r => r.json())
            .then(data => {
                const url = isDebug
                    ? (data.url as string).replace(":3333", ":1420")
                    : data.url;
                setLanUrl(url);
            })
            .catch(() => { });
    }, []);

    return (
        <div style={{ maxWidth: 820, width: '100%', margin: '0 auto' }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card size="small" title={<SectionTitle icon={<SettingOutlined />}>Generale</SectionTitle>}>
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
                    <SettingRow
                        title="Preventivi sul calendario"
                        description="Mostra i preventivi come eventi nel calendario"
                        control={
                            <Switch
                                checked={settings.showEstimatesOnCalendar}
                                onChange={(checked) => updateSettings({ showEstimatesOnCalendar: checked })}
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

                <EditableCard
                    title="Valori predefiniti"
                    icon={<CalendarOutlined />}
                    onSave={(values) => updateSettings({
                        defaultWhatsappMessage: values.defaultWhatsappMessage,
                        defaultEstimateNotes: values.defaultEstimateNotes,
                        defaultAppointmentDuration: values.defaultAppointmentDuration,
                    })}
                    fields={(draft, setDraft, editing) => <>
                        <SettingRow
                            title="Messaggio WhatsApp"
                            description="Testo precompilato quando contatti un cliente"
                            control={
                                <Input.TextArea
                                    rows={2}
                                    style={{ width: 260 }}
                                    placeholder="Buongiorno, la sua auto è pronta..."
                                    value={draft.defaultWhatsappMessage}
                                    onChange={(e) => setDraft('defaultWhatsappMessage', e.target.value)}
                                    disabled={!editing}
                                />
                            }
                        />
                        <SettingRow
                            title="Note preventivo"
                            description="Testo precompilato nelle note dei nuovi preventivi"
                            control={
                                <Input.TextArea
                                    rows={2}
                                    style={{ width: 260 }}
                                    placeholder="Condizioni, garanzia, pagamento..."
                                    value={draft.defaultEstimateNotes}
                                    onChange={(e) => setDraft('defaultEstimateNotes', e.target.value)}
                                    disabled={!editing}
                                />
                            }
                        />
                        <SettingRow
                            title="Durata appuntamento"
                            description="Durata predefinita in minuti per nuovi appuntamenti"
                            control={
                                <InputNumber
                                    min={15}
                                    max={480}
                                    step={15}
                                    value={draft.defaultAppointmentDuration}
                                    onChange={(v) => setDraft('defaultAppointmentDuration', v ?? 60)}
                                    disabled={!editing}
                                    addonAfter="min"
                                />
                            }
                        />
                    </>}
                />

                <Card size="small" title={<SectionTitle icon={<DatabaseOutlined />}>Anagrafiche e dati</SectionTitle>}>
                    <Collapse
                        items={[
                            { key: 'items', label: 'Voci di default', children: <DefaultEstimateItems /> },
                            { key: 'makers', label: <MakersCollapseLabel />, children: <MakersModelsImporter /> },
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
                            onConfirm={() => api.resetSettings().then(() => updateSettings())}
                        >
                            <Button danger block>Reset impostazioni</Button>
                        </Popconfirm>
                    </Card>
                )}
            </Space>
        </div>
    );
}
