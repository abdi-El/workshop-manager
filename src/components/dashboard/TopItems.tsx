import { CheckOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, message, Modal, Table, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { api } from "../../modules/api";

interface TopItem {
    description: string;
    usage_count: number;
    avg_price: number;
    is_default: number;
}

export default function TopItems({ workshopId }: { workshopId?: number }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TopItem[]>([]);

    function load() {
        setLoading(true);
        api.getTopItems(workshopId).then(setData).finally(() => setLoading(false));
    }

    useEffect(load, [workshopId]);

    function addToDefaults(item: TopItem) {
        Modal.confirm({
            title: "Aggiungi ai predefiniti",
            content: `Vuoi aggiungere "${item.description}" (€ ${item.avg_price.toFixed(2)}) alle voci predefinite?`,
            okText: "Aggiungi",
            cancelText: "Annulla",
            onOk: () => api.createDefaultEstimateItem({ description: item.description, unit_price: item.avg_price })
                .then(() => {
                    message.success("Aggiunto ai predefiniti!");
                    load();
                })
                .catch((e) => message.error("Errore: " + e)),
        });
    }

    const columns = [
        {
            title: "Voce",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Utilizzi",
            dataIndex: "usage_count",
            key: "usage_count",
            width: 80,
        },
        {
            title: "Prezzo medio",
            dataIndex: "avg_price",
            key: "avg_price",
            width: 110,
            render: (v: number) => `€ ${v.toFixed(2)}`,
        },
        {
            title: "",
            key: "action",
            width: 50,
            render: (_: unknown, item: TopItem) =>
                item.is_default ? (
                    <Tooltip title="Già nei predefiniti">
                        <CheckOutlined style={{ color: "#52c41a" }} />
                    </Tooltip>
                ) : (
                    <Tooltip title="Aggiungi ai predefiniti">
                        <Button
                            type="text"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => addToDefaults(item)}
                        />
                    </Tooltip>
                ),
        },
    ];

    return (
        <Card loading={loading} style={{ marginTop: 16 }} title="Voci ricambi più usate">
            <Table
                dataSource={data}
                columns={columns}
                rowKey="description"
                pagination={false}
                size="small"
            />
        </Card>
    );
}
