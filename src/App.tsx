import { ConfigProvider, theme } from 'antd';
import { useEffect } from "react";
import Paginator from "./components/Paginator";
import { useStore } from './state';


export default function Page() {
  const { settings, updateSettings, updateDatabaseData } = useStore((state) => state)

  useEffect(() => {
    updateSettings()
    updateDatabaseData(["workshops", "customers"])
  }, [])

  return <ConfigProvider
    theme={{
      algorithm: settings.theme == "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }}>
    <Paginator />
  </ConfigProvider >
}

