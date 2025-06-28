import { ConfigProvider, theme } from 'antd';
import { useEffect } from "react";
import Paginator from "./components/Paginator";
import { populateMakers } from './modules/database';
import { useDatabaseStore, useStore } from './modules/state';


export default function Page() {
  const { settings, updateSettings } = useStore((state) => state)
  const { updateDatabaseData } = useDatabaseStore((state) => state)

  useEffect(() => {
    populateMakers()
    updateDatabaseData(["workshops", "customers", "makers", "models", "cars"])
    updateSettings()
  }, [])

  return <ConfigProvider
    theme={{
      algorithm: settings.theme == "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }}>
    <Paginator />
  </ConfigProvider >
}

