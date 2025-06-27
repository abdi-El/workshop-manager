import { PlusOutlined } from "@ant-design/icons";
import { Button, Input, List, ListProps, Row, Typography } from "antd";
import { useState } from "react";
const { Search } = Input;

interface Props<T> extends ListProps<T> {
    onAddClick?: () => void;
    onItemClick?: (item: T) => void;
    paramToRender: keyof T;
    title: string
}

export default function ListWithSearch<T>({ dataSource, ...props }: Props<T>) {
    const [filtered, setFiltered] = useState<T[] | null>(null);

    return <List
        className='list'
        pagination={{ position: "bottom", align: "center", pageSize: 5 }}
        header={<Row justify={"space-between"} align="middle">
            <div>
                <Typography.Title level={5}>{props.title}</Typography.Title>
                <Search placeholder="Cerca per nome" onSearch={(value) => {
                    if (!dataSource) return
                    if (value.trim() === "") {
                        setFiltered(null);
                    } else {
                        setFiltered(dataSource.filter(item => {
                            const itemValue = item[props.paramToRender]?.toString().toLowerCase();
                            return itemValue?.includes(value.toLowerCase());
                        }));
                    }
                }} enterButton />
            </div>
            <Button icon={<PlusOutlined />} type='primary' />
        </Row>}
        bordered
        dataSource={filtered != null ? filtered : dataSource}
        renderItem={(item) => (
            <List.Item className='item' onClick={() => { if (props.onItemClick) props.onItemClick(item) }}>
                {item[props.paramToRender] as string}
            </List.Item>
        )}

        {...props}
    />
}