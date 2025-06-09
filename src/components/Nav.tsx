import { CarOutlined, FileTextOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useStore } from '../state';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    {
        label: 'Preventivi',
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

    const onClick: MenuProps['onClick'] = (e) => {
        updatePage(e.key)
    };


    return <Menu onClick={onClick} selectedKeys={[page]} mode="horizontal" items={items} />;
};
