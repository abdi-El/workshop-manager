import { load } from '@tauri-apps/plugin-store';
import { ConfigProvider, theme } from 'antd';
import { useEffect } from "react";
import Paginator from "./components/Paginator";
import { useStore } from './state';
import { SettingsType } from './types/common';

const store = await load('settings.json', { autoSave: false });


export default function Page() {
  const { setLoading, settings, setSettings } = useStore((state) => state)

  useEffect(() => {
    setLoading(true);
    store.get('settings').then(storeSettings => {
      setSettings(storeSettings as SettingsType || settings);
    }).finally(() => setLoading(false))
  }, [])

  return <ConfigProvider
    theme={{
      algorithm: settings.theme == "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }}>
    <Paginator />
  </ConfigProvider >
}

