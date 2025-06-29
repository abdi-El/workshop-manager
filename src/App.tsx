import { ConfigProvider, theme } from 'antd';
import itIT from 'antd/locale/it_IT';
import dayjs from 'dayjs';
import 'dayjs/locale/it'; // Import Italian locale
import updateLocale from 'dayjs/plugin/updateLocale';
import { useEffect } from "react";
import Paginator from "./components/Paginator";
import { populateMakers } from './modules/database';
import { useDatabaseStore, useStore } from './modules/state';

dayjs.locale('it'); // Set default locale to Italian
dayjs.extend(updateLocale);


export default function Page() {
  const { settings, updateSettings } = useStore((state) => state)
  const { updateDatabaseData } = useDatabaseStore((state) => state)

  useEffect(() => {
    populateMakers()
    updateDatabaseData(["workshops", "customers", "makers", "models", "cars", "estimates"])
    updateSettings()
  }, [])

  return <ConfigProvider
    locale={itIT}
    theme={{
      algorithm: settings?.theme == "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }}>
    <Paginator />
  </ConfigProvider >
}

