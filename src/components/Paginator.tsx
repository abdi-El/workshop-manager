import { CalendarOutlined, CarOutlined, FileTextOutlined, LoadingOutlined, SettingOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu, Spin, Tooltip, Typography } from "antd";
import { useScraper } from '../modules/hooks';
import { useDatabaseStore, useStore } from "../modules/state";
import Cars from '../pages/Cars';
import Customers from '../pages/Customers';
import Estimates from '../pages/Estimates';
import Planner from '../pages/Planner';
import Settings from '../pages/Settings';
import Workshops from '../pages/Workshops';

const { Title } = Typography;

export default function Paginator() {
    const { page, loading, updatePage } = useStore()
    const { databaseLoading } = useDatabaseStore()
    const { percentage, loading: scraping } = useScraper()
    const items = {
        "planner": {
            label: 'Calendario',
            key: 'planner',
            icon: <CalendarOutlined />,
            page: <Planner />
        },
        "estimates": {
            label: 'Preventivi',
            key: 'estimates',
            icon: <FileTextOutlined />,
            page: <Estimates />
        },
        "cars": {
            label: 'Auto',
            key: 'cars',
            icon: <CarOutlined />,
            page: <Cars />
        },
        "customers": {
            label: 'Clienti',
            key: 'customers',
            icon: <UserOutlined />,
            page: <Customers />
        },
        "workshop": {
            label: 'Officina',
            key: 'workshop',
            icon: <ToolOutlined />,
            page: <Workshops />
        },
        "settings": {
            label: 'Impostazioni',
            key: 'settings',
            icon: <SettingOutlined />,
            page: <Settings />
        },
    }

    return <Layout style={{ width: '100%', height: '100vh' }}>

        <Spin spinning={loading || databaseLoading} indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} >

            <Menu style={{ marginBottom: "10px" }} onClick={(e) => {
                updatePage(e.key)
            }} selectedKeys={[page]} mode="horizontal" items={Object.values(items)} />

            <div style={{ padding: '0px 10px', }}>
                <Title level={2}>{items[page as keyof typeof items]?.label}</Title>
                {items[page as keyof typeof items]?.page}
            </div>
        </Spin>
        {page != "settings" && scraping && <Tooltip title={`Caricamento Merche e Modelli ${percentage}%`}>
            <Spin percent={percentage} tip={percentage} spinning={scraping} style={{ position: "fixed", bottom: "2%", right: "2%" }} size="large" />
        </Tooltip>
        }

    </Layout>

}