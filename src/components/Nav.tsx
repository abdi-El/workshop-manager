import { CarOutlined, FileTextOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useStore } from '../modules/state';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    {
        label: 'Lavori',
        key: 'estimates',
        icon: <FileTextOutlined />,
    },
    {
        label: 'Clienti',
        key: 'customers',
        icon: <UserOutlined />,
    },
    {
        label: 'Auto',
        key: 'cars',
        icon: <CarOutlined />,
    },
    {
        label: 'Impostazioni',
        key: 'settings',
        icon: <SettingOutlined />,
    },
];

export default function Nav() {
    const { page, updatePage } = useStore((state) => state)
    return <Menu style={{ marginBottom: "10px" }} onClick={(e) => {
        updatePage(e.key)
    }} selectedKeys={[page]} mode="horizontal" items={items} />;
};
