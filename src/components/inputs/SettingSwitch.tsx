import { Switch } from "antd";
import { useStore } from "../../modules/state";
import { SettingsType } from "../../types/common";

interface Props {
    settingKey: keyof SettingsType;
}

export default function SettingSwitch({ settingKey }: Props) {
    const { settings, updateSettings } = useStore((state) => state)
    return <Switch defaultChecked={true} checked={settings[settingKey] as boolean} onChange={(checked) => updateSettings({ [settingKey]: checked })} />
}