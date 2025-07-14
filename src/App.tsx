import { ConfigProvider, theme } from 'antd';
import itIT from 'antd/locale/it_IT';
import dayjs from 'dayjs';
import 'dayjs/locale/it'; // Import Italian locale
import updateLocale from 'dayjs/plugin/updateLocale';
import { useEffect } from "react";
import Paginator from "./components/Paginator";
import { initDatabase } from './modules/database';
import { useDatabaseStore, useStore } from './modules/state';

dayjs.locale('it'); // Set default locale to Italian
dayjs.extend(updateLocale);


export default function Page() {
  const { settings, updateSettings } = useStore((state) => state)
  const { updateDatabaseData } = useDatabaseStore((state) => state)
  async function initApp() {
    await initDatabase()
    updateSettings()
    updateDatabaseData()
  }

  useEffect(() => {
    initApp()
  }, [])

  return <ConfigProvider
    locale={itIT}
    theme={{
      algorithm: settings?.theme == "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }}>
    <div id={settings?.theme}>
      <Paginator />
    </div>
  </ConfigProvider >
}

