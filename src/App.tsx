import { ConfigProvider, theme } from 'antd';
import itIT from 'antd/locale/it_IT';
import dayjs from 'dayjs';
import 'dayjs/locale/it';
import updateLocale from 'dayjs/plugin/updateLocale';
import { useEffect } from "react";
import ActivatorOverlay from './components/ActivatonKeyOverlay';
import Paginator from "./components/Paginator";
import { initDatabase } from './modules/database';
import { useScraper } from './modules/hooks';
import { useDatabaseStore, useStore } from './modules/state';

dayjs.locale('it');
dayjs.extend(updateLocale);

export default function Page() {
  const { settings, updateSettings } = useStore((state) => state)
  const { updateDatabaseData, makers } = useDatabaseStore((state) => state)
  const { trigger, setPercentage } = useScraper()
  async function initApp() {
    await initDatabase()
    updateSettings()
    updateDatabaseData()
    if (!makers) {
      trigger()
    } else {
      setPercentage(100)
    }
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
    <ActivatorOverlay />
  </ConfigProvider >
}

