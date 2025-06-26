import { CarOutlined, FileTextOutlined, LoadingOutlined, SettingOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu, Spin, Typography } from "antd";
import Customers from '../pages/Customers';
import Settings from '../pages/Settings';
import Workshops from '../pages/Workshops';
import { useDatabaseStore, useStore } from "../state";

const { Title } = Typography;

export default function Paginator() {
    const { page, loading, updatePage } = useStore((state) => state)
    const { databaseLoading } = useDatabaseStore((state) => state)
    const items = {
        "estimates": {
            label: 'Preventivi',
            key: 'estimates',
            icon: <FileTextOutlined />,
            page: <div>Estimates Page</div>
        },
        "customers": {
            label: 'Clienti',
            key: 'customers',
            icon: <UserOutlined />,
            page: <Customers />
        },
        "cars": {
            label: 'Auto',
            key: 'cars',
            icon: <CarOutlined />,
            page: <div>Cars Page</div>
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
    </Layout>

}