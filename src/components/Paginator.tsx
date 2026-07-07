import { CalendarOutlined, CarOutlined, DashboardOutlined, FileTextOutlined, LoadingOutlined, SettingOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu, Row, Spin, theme, Typography } from "antd";
import { lazy, Suspense } from 'react';
import { useScraper } from '../modules/hooks';
import { useStore } from "../modules/state";
import ErrorBoundary from './ErrorBoundary';
import GlobalSearch from './GlobalSearch';

const Cars = lazy(() => import('../pages/Cars'));
const Customers = lazy(() => import('../pages/Customers'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Estimates = lazy(() => import('../pages/Estimates'));
const Planner = lazy(() => import('../pages/Planner'));
const Settings = lazy(() => import('../pages/Settings'));
const Workshops = lazy(() => import('../pages/Workshops'));

const { Title } = Typography;

export default function Paginator() {
    const { page, loading, updatePage, dbReady } = useStore()
    const { percentage, loading: scraping } = useScraper()
    const { token } = theme.useToken()
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

        <Layout.Header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: 0, display: 'flex', alignItems: 'center', background: token.colorBgContainer }}>
            <Menu style={{ flex: 1, minWidth: 0 }} onClick={(e) => {
                updatePage(e.key)
            }} selectedKeys={[page]} mode="horizontal" items={Object.values(items)} />
            <div style={{ padding: '0 16px' }}>
                <GlobalSearch />
            </div>
        </Layout.Header>

        <Spin spinning={loading || !dbReady} indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} >
            <div style={{ padding: '0px 10px', marginTop: 74 }}>
                <Title level={2}>{items[page as keyof typeof items]?.label}</Title>
                <ErrorBoundary>
                    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}><Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} /></div>}>
                        {dbReady && items[page as keyof typeof items]?.page}
                    </Suspense>
                </ErrorBoundary>
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