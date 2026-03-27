import { Button, Collapse, Layout, Row, Select } from 'antd';
import DefaultEstimateItems from '../components/DefaultEstimateItems';
import SettingSwitch from '../components/inputs/SettingSwitch';
import MakersModelsImporter from '../components/MakersModelsImporter';
import themes from "../components/pdf/themes.json";
import ThemeSelector from '../components/pdf/ThemeSelector';
import { storeSettings } from '../modules/database';
import { useStore } from '../modules/state';


export default function Settings() {
    const { settings, updateSettings, isDebug } = useStore((state) => state)


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