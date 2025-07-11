import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd';
import type { ColumnType } from 'antd/es/table';

export function getColumnSearchProps(
    dataIndex: string,
    label: string,
    inputRef: any
): ColumnType {
    return {
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={inputRef}
                    placeholder={`Cerca per ${label}`}
                    value={selectedKeys[0] as string}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() => confirm()}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={() => confirm()}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Cerca
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters && clearFilters()
                            confirm()
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ?.toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => inputRef.current?.select(), 100);
            }
        },
    }
};