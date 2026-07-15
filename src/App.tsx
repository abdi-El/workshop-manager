import { invoke } from '@tauri-apps/api/core';
import { ConfigProvider, theme } from 'antd';
import itIT from 'antd/locale/it_IT';
import dayjs from 'dayjs';
import 'dayjs/locale/it';
import updateLocale from 'dayjs/plugin/updateLocale';
import { useEffect } from "react";
import Paginator from "./components/Paginator";
import { initDatabaseService } from './modules/db/instance';
import { useScraper } from './modules/hooks';
import { useStore } from './modules/state';
import { initStore } from './modules/store';

dayjs.locale('it');
dayjs.extend(updateLocale);

export default function Page() {
  const { settings, updateSettings, setIsDebug, setDbReady } = useStore((state) => state)
  const { setPercentage } = useScraper()
  async function initApp() {
    const isDebug = await invoke("is_debug") as boolean
    setIsDebug(isDebug)
    await initDatabaseService()
    await initStore()
    setDbReady(true)
    updateSettings()
    setPercentage(100)
  }

  useEffect(() => {
    initApp()
  }, [])

  return <ConfigProvider
    locale={itIT}
    theme={{
      algorithm: settings?.theme == "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }}
  >
    <div id={settings?.theme}>
      <Paginator />
    </div>
  </ConfigProvider >
}

