import { CarOutlined, FileTextOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { AutoComplete, Input, InputRef, Space, Typography } from 'antd';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { globalSearch, SearchResult, SearchResultType } from '../modules/search';
import { useDatabaseStore, useStore } from '../modules/state';

const groups: Record<SearchResultType, { label: string; icon: ReactNode }> = {
    customer: { label: 'Clienti', icon: <UserOutlined /> },
    car: { label: 'Auto', icon: <CarOutlined /> },
    estimate: { label: 'Lavori', icon: <FileTextOutlined /> },
};

export default function GlobalSearch() {
    const [value, setValue] = useState('');
    const { customers, cars, estimates } = useDatabaseStore((state) => state);
    const { updatePage, setSearchTarget } = useStore((state) => state);
    const inputRef = useRef<InputRef>(null);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const options = useMemo(() => {
        const results = globalSearch(value, { customers, cars, estimates });
        return (Object.keys(groups) as SearchResultType[])
            .map((type) => {
                const groupResults = results.filter((r) => r.type === type);
                if (!groupResults.length) return null;
                return {
                    label: groups[type].label,
                    options: groupResults.map((r) => ({
                        value: `${r.type}-${r.id}`,
                        result: r,
                        label: (
                            <Space>
                                {groups[type].icon}
                                <span>{r.title}</span>
                                <Typography.Text type="secondary">{r.subtitle}</Typography.Text>
                            </Space>
                        ),
                    })),
                };
            })
            .filter((group) => group !== null);
    }, [value, customers, cars, estimates]);

    const onSelect = (_: string, option: { result?: SearchResult }) => {
        const result = option.result;
        setValue('');
        inputRef.current?.blur();
        if (!result) return;
        setSearchTarget({ table: result.page, id: result.id });
        updatePage(result.page);
    };

    return <AutoComplete
        value={value}
        options={options as any}
        onChange={setValue}
        onSelect={onSelect as any}
        filterOption={false}
        style={{ width: 300 }}
        popupMatchSelectWidth={420}
    >
        <Input
            ref={inputRef}
            prefix={<SearchOutlined />}
            placeholder="Cerca cliente, targa, lavoro… (Ctrl+K)"
            allowClear
        />
    </AutoComplete>;
}
