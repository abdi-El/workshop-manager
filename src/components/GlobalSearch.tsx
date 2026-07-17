import { CarOutlined, FileTextOutlined, PhoneOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Input, InputRef, Typography } from 'antd';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useDebounce, useIsMobile } from '../modules/hooks';
import { globalSearch, SearchResult, SearchResultType } from '../modules/search';
import { useStore } from '../modules/state';

const groups: Record<SearchResultType, { label: string; icon: ReactNode }> = {
    customer: { label: 'Clienti', icon: <UserOutlined /> },
    car: { label: 'Auto', icon: <CarOutlined /> },
    estimate: { label: 'Lavori', icon: <FileTextOutlined /> },
};

interface GlobalSearchProps {
    autoFocus?: boolean;
    onSelect?: () => void;
}

export default function GlobalSearch({ autoFocus, onSelect: onSelectCallback }: GlobalSearchProps = {}) {
    const [value, setValue] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const { updatePage, setSearchTarget, dbReady, settings } = useStore((state) => state);
    const workshopId = settings.selectedWorkshop?.id;
    const inputRef = useRef<InputRef>(null);
    const isMobile = useIsMobile();

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

    const debouncedValue = useDebounce(value, 250);

    useEffect(() => {
        if (!dbReady || !debouncedValue.trim()) {
            setResults([]);
            return;
        }
        let cancelled = false;
        globalSearch(debouncedValue, workshopId).then((found) => {
            if (!cancelled) setResults(found);
        }).catch(() => {
            if (!cancelled) setResults([]);
        });
        return () => { cancelled = true };
    }, [debouncedValue, dbReady]);

    const options = (Object.keys(groups) as SearchResultType[])
        .map((type) => {
            const groupResults = results.filter((r) => r.type === type);
            if (!groupResults.length) return null;
            return {
                label: groups[type].label,
                options: groupResults.map((r) => ({
                    value: `${r.type}-${r.id}`,
                    result: r,
                    label: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, maxWidth: '100%' }}>
                            {groups[type].icon}
                            <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{r.title}</span>
                            <Typography.Text type="secondary" ellipsis style={{ flex: 1, minWidth: 0 }}>
                                {r.subtitle}
                            </Typography.Text>
                            {isMobile && r.type === 'customer' && r.phone && (
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<PhoneOutlined />}
                                    href={`tel:${r.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    style={{ flexShrink: 0 }}
                                />
                            )}
                        </div>
                    ),
                })),
            };
        })
        .filter((group) => group !== null);

    useEffect(() => {
        if (autoFocus) inputRef.current?.focus();
    }, [autoFocus]);

    const onSelect = (_: string, option: { result?: SearchResult }) => {
        const result = option.result;
        setValue('');
        inputRef.current?.blur();
        onSelectCallback?.();
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
        style={{ width: "100%" }}
        popupMatchSelectWidth={true}
    >
        <Input
            ref={inputRef}
            prefix={<SearchOutlined />}
            placeholder="Cerca cliente, targa, lavoro… (Ctrl+K)"
            allowClear
        />
    </AutoComplete>;
}
