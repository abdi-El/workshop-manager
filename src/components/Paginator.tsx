import { CalendarOutlined, CarOutlined, DashboardOutlined, FileTextOutlined, LoadingOutlined, SettingOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu, Row, Spin, Typography } from "antd";
import { useScraper } from '../modules/hooks';
import { useDatabaseStore, useStore } from "../modules/state";
import Cars from '../pages/Cars';
import Customers from '../pages/Customers';
import Dashboard from '../pages/Dashboard';
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
        "dashboard": {
            label: 'Dashboard',
            key: 'dashboard',
            icon: <DashboardOutlined />,
            page: <Dashboard />
        },
        "planner": {
            label: 'Calendario',
            key: 'planner',
            icon: <CalendarOutlined />,
            page: <Planner />
        },
        "estimates": {
            label: 'Lavori',
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

    return <Layout style={{ width: '100%', minHeight: '100vh' }}>

        <Layout.Header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: 0 }}>
            <Menu onClick={(e) => {
                updatePage(e.key)
            }} selectedKeys={[page]} mode="horizontal" items={Object.values(items)} />
        </Layout.Header>

        <Spin spinning={loading || databaseLoading} indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} >
            <div style={{ padding: '0px 10px', marginTop: 74 }}>
                <Title level={2}>{items[page as keyof typeof items]?.label}</Title>
                {items[page as keyof typeof items]?.page}
            </div>
        </Spin>
        {scraping && <div className='scraper'>
            <Row className='scraper-spinner' >
                <Spin percent={percentage} tip={"caricamento"} spinning={true} size="large" />
                <div style={{ marginTop: "15px" }}>
                    Caricamento: {percentage}%
                </div>
            </Row>
        </div>}

    </Layout>

}