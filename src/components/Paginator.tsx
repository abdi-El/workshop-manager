import { CalendarOutlined, CarOutlined, DashboardOutlined, FileTextOutlined, LoadingOutlined, MenuOutlined, SearchOutlined, SettingOutlined, SwapOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Drawer, Dropdown, Layout, Menu, Row, Spin, theme, Typography } from "antd";
import { lazy, Suspense, useEffect, useState } from 'react';
import { api } from '../modules/api';
import { useIsMobile, useScraper } from '../modules/hooks';
import { useStore } from "../modules/state";
import { Workshop } from '../types/database';
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
    const { page, loading, updatePage, dbReady, settings, updateSettings } = useStore()
    const { percentage, loading: scraping } = useScraper()
    const { token } = theme.useToken()
    const isMobile = useIsMobile()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [workshops, setWorkshops] = useState<Workshop[]>([])

    useEffect(() => {
        if (dbReady) {
            api.getWorkshops().then(setWorkshops);
        }
    }, [dbReady, page]);

    const workshopMenuItems = workshops.map((w) => ({
        key: w.id.toString(),
        label: w.name,
        onClick: () => updateSettings({ selectedWorkshop: w }),
    }));

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

    const pageKeys = Object.keys(items);
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.altKey && e.key >= '1' && e.key <= '7') {
                e.preventDefault();
                const idx = parseInt(e.key) - 1;
                if (pageKeys[idx]) updatePage(pageKeys[idx]);
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const onMenuClick = (key: string) => {
        updatePage(key);
        setDrawerOpen(false);
    };

    return <Layout style={{ width: '100%', minHeight: '100vh' }}>

        <Layout.Header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 12px', display: 'flex', alignItems: 'center', background: token.colorBgContainer }}>
            {isMobile ? <>
                <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
                <Title level={4} style={{ margin: '0 auto 0 8px', flex: 1 }}>
                    {items[page as keyof typeof items]?.label}
                </Title>
            </> : <>
                <Menu style={{ flex: 1, minWidth: 0 }} onClick={(e) => onMenuClick(e.key)} selectedKeys={[page]} mode="horizontal" items={Object.values(items)} />
            </>}
            {workshops.length > 1 && (
                <Dropdown menu={{ items: workshopMenuItems, selectedKeys: settings.selectedWorkshop?.id ? [settings.selectedWorkshop.id.toString()] : [] }}>
                    <Button type="text" icon={<SwapOutlined />}>
                        {!isMobile && <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {settings.selectedWorkshop?.name}
                        </span>}
                    </Button>
                </Dropdown>
            )}
            <Button type="text" icon={<SearchOutlined />} onClick={() => setSearchOpen(!searchOpen)} />
        </Layout.Header>

        <Drawer
            placement="top"
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            height="auto"
            styles={{ body: { padding: '12px 16px' } }}
            closable={false}
            mask={true}
        >
            <GlobalSearch autoFocus onSelect={() => setSearchOpen(false)} />
        </Drawer>

        <Drawer
            placement="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            width={250}
            styles={{ body: { padding: 0 } }}
        >
            <Menu
                mode="vertical"
                selectedKeys={[page]}
                onClick={(e) => onMenuClick(e.key)}
                items={Object.values(items)}
                style={{ border: 'none' }}
            />
        </Drawer>

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
