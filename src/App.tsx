import { load } from '@tauri-apps/plugin-store';
import { ConfigProvider, Layout, theme } from 'antd';
import { useEffect } from "react";
import Nav from "./components/Nav";
import Paginator from "./components/Paginator";
import Settings from "./pages/Settings";
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

    <Layout style={{ width: '100%', height: '100vh' }}>
      <Nav />
      <Paginator pages={{
        estimates: <div>Estimates Page</div>,
        customers: <div>Customers Page</div>,
        cars: <div>Cars Page</div>,
        settings: <Settings />,
      }} />
    </Layout>


  </ConfigProvider >
}

