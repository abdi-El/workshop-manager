// ThemeSelector.tsx
import { Radio, Typography } from 'antd';
import { useStore } from '../../modules/state';
import themes from "./themes.json";


const { Text } = Typography;

const THEMES: { key: string; label: string; description: string }[] = Object.entries(themes).map(([key, value]) => {
    return {
        key: key,
        label: value.name,
        description: value.desciption
    };
});



export default function ThemeSelector() {
    const { settings, updateSettings } = useStore((state) => state)

    return (
        <Radio.Group
            value={settings.pdfTheme}
            onChange={(e) => {
                updateSettings({
                    pdfTheme: e.target.value
                })
            }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}
        >
            {THEMES.map(theme => (
                <Radio.Button
                    key={theme.key}
                    value={theme.key}
                    style={{ height: 'auto', padding: '10px 14px', textAlign: 'left' }}
                >
                    <Text strong style={{ display: 'block' }}>{theme.label}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{theme.description}</Text>
                </Radio.Button>
            ))}
        </Radio.Group>
    );
}