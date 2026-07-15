import { Button, Collapse, Layout, Row, Select, Typography } from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import DefaultEstimateItems from '../components/DefaultEstimateItems';
import SettingSwitch from '../components/inputs/SettingSwitch';
import MakersModelsImporter from '../components/MakersModelsImporter';
import themes from "../components/pdf/themes.json";
import ThemeSelector from '../components/pdf/ThemeSelector';
import { storeSettings } from '../modules/store';
import { useStore } from '../modules/state';
import { isTauri } from '../modules/utils';


export default function Settings() {
    const { settings, updateSettings, isDebug } = useStore((state) => state)
    const [lanUrl, setLanUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!isTauri()) return;
        fetch("http://localhost:3333/api/lan-url")
            .then(r => r.json())
            .then(data => setLanUrl(data.url))
            .catch(() => {});
    }, []);

    return (
        <Layout>
            <Row style={{ marginBottom: 10 }}>
                <strong style={{ marginRight: 10 }}>Tema app: </strong>
                <Select value={settings.theme} onChange={(value) => updateSettings({ theme: value })} style={{ width: 120, marginBottom: 20 }}>
                    <Select.Option value="light">Chiaro</Select.Option>
                    <Select.Option value="dark">Scuro</Select.Option>
                </Select>
            </Row>

            <Row style={{ marginBottom: 10 }}>
                <strong style={{ marginRight: 10 }}>Mostra statistiche di fatturato: </strong>
                <SettingSwitch settingKey="showRevenueStatistics" />
            </Row>

            <Collapse>
                <Collapse.Panel header="Voci di default" key="1">
                    <DefaultEstimateItems />
                </Collapse.Panel>
                <Collapse.Panel header="Importa Modelli e Marche" key="2">
                    <MakersModelsImporter />
                </Collapse.Panel>
                <Collapse.Panel header="Impostazioni preventivo PDF" key="3" >
                    <Row style={{ marginBottom: 10 }}>
                        <strong style={{ marginRight: 10 }}>Mostra numero pdf: </strong>
                        <SettingSwitch settingKey="showPdfNumber" />
                    </Row>
                    <div>
                        <strong style={{ marginRight: 5 }}>Tema: {themes[settings.pdfTheme as keyof typeof themes].name} </strong>
                        <ThemeSelector />
                    </div>
                </Collapse.Panel>
            </Collapse>
            {isTauri() && lanUrl && <Collapse style={{ marginTop: 10 }}>
                <Collapse.Panel header="Accesso Mobile" key="lan">
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                        <QRCodeSVG value={lanUrl} size={200} />
                        <Typography.Text copyable>{lanUrl}</Typography.Text>
                        <Typography.Text type="secondary">Scansiona il QR dal telefono per accedere all'app</Typography.Text>
                    </div>
                </Collapse.Panel>
            </Collapse>}
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