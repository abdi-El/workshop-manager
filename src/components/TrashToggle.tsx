import { DeleteOutlined, ReloadOutlined, RestOutlined } from '@ant-design/icons';
import { Button, List, message, Modal, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';

interface TrashToggleProps<T extends { id: number }> {
    workshopId?: number;
    getTrash: (workshopId?: number) => Promise<T[]>;
    restore: (id: number) => Promise<void>;
    purge: (id: number) => Promise<void>;
    renderLabel: (item: T) => string;
    onRestore: () => void;
}

export default function TrashToggle<T extends { id: number }>({
    workshopId, getTrash, restore, purge, renderLabel, onRestore
}: TrashToggleProps<T>) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);

    function load() {
        setLoading(true);
        getTrash(workshopId).then(setItems).finally(() => setLoading(false));
    }

    useEffect(() => {
        if (open) load();
    }, [open, workshopId]);

    function handleRestore(id: number) {
        restore(id).then(() => {
            message.success("Ripristinato!");
            load();
            onRestore();
        }).catch((e) => message.error("Errore: " + e));
    }

    function handlePurge(id: number) {
        purge(id).then(() => {
            message.success("Eliminato definitivamente!");
            load();
        }).catch((e) => message.error("Errore: " + e));
    }

    return <>
        <Tooltip title="Cestino">
            <Button icon={<DeleteOutlined />} onClick={() => setOpen(true)} />
        </Tooltip>
        <Modal
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
            title={<Space><RestOutlined /> Cestino</Space>}
        >
            <List
                loading={loading}
                dataSource={items}
                locale={{ emptyText: "Cestino vuoto" }}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Tooltip title="Ripristina" key="restore">
                                <Button
                                    icon={<ReloadOutlined />}
                                    size="small"
                                    onClick={() => handleRestore(item.id)}
                                />
                            </Tooltip>,
                            <Popconfirm
                                key="purge"
                                title="Eliminare definitivamente?"
                                description="Questa azione non può essere annullata."
                                okText="Elimina"
                                okType="danger"
                                cancelText="Annulla"
                                onConfirm={() => handlePurge(item.id)}
                            >
                                <Tooltip title="Elimina definitivamente">
                                    <Button
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        danger
                                    />
                                </Tooltip>
                            </Popconfirm>
                        ]}
                    >
                        <Typography.Text>{renderLabel(item)}</Typography.Text>
                    </List.Item>
                )}
            />
            {items.length > 0 && (
                <Tag color="orange" style={{ marginTop: 8 }}>
                    {items.length} elemento{items.length > 1 ? 'i' : ''} nel cestino
                </Tag>
            )}
        </Modal>
    </>;
}
