import { ConfigProvider, theme } from 'antd';
import itIT from 'antd/locale/it_IT';
import dayjs from 'dayjs';
import 'dayjs/locale/it';
import updateLocale from 'dayjs/plugin/updateLocale';
import { useEffect } from "react";
import Paginator from "./components/Paginator";
import { useScraper } from './modules/hooks';
import { useStore } from './modules/state';
import { fetchIsDebug } from './modules/utils';

dayjs.locale('it');
dayjs.extend(updateLocale);

export default function Page() {
  const { settings, updateSettings, setIsDebug, setDbReady } = useStore((state) => state)
  const { setPercentage } = useScraper()
  async function initApp() {
    setIsDebug(await fetchIsDebug());
    setDbReady(true);
    updateSettings();
    setPercentage(100);
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
