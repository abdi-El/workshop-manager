import { PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Input, List, message, Modal } from "antd";
import { useEffect, useState } from "react";
import { api } from "../modules/api";
import { useDebounce } from "../modules/hooks";
import { EstimateDefaultItem } from "../types/database";
import DeleteButton from "./buttons/DeleteButton";
import DefaultEstimateItemForm from "./forms/DefaultEstimateItemForm";

export default function DefaultEstimateItems() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<EstimateDefaultItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<EstimateDefaultItem>();
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 250);

    const loadItems = (query: string) => {
        api.searchDefaultEstimateItems(query).then((rows) => {
            setItems(rows);
        }).catch((error) => {
            message.error("Errore nel recupero delle voci: " + error);
        });
    };

    useEffect(() => {
        loadItems(debouncedSearch);
    }, [debouncedSearch]);

    return <>
        <Modal title="Voci di default" open={open} onCancel={() => setOpen(false)} footer={null} width={"80%"} styles={{ body: { maxWidth: "100%" } }}>
            <DefaultEstimateItemForm onSubmit={() => {
                setOpen(false);
                loadItems(searchTerm);
            }} item={selectedItem} />
        </Modal>
        <List header={
            <Flex gap={8} wrap>
                <Input
                    placeholder="Cerca per nome"
                    style={{ flex: 1, minWidth: 160 }}
                    value={searchTerm}
                    onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                    setSelectedItem(undefined);
                    setOpen(true);
                }}>Aggiungi voce</Button>
            </Flex>
        }>
            {
                items.length ? items.map(item => (
                    <List.Item
                        key={item.id}
                        actions={[
                            <Button key="edit" size="small" type="dashed" onClick={() => {
                                setSelectedItem(item);
                                setOpen(true);
                            }}>Modifica</Button>,
                            <DeleteButton key="del" onConfirm={() => {
                                api.deleteDefaultEstimateItem(item.id).then(() => {
                                    message.success("Eliminato con successo!");
                                    loadItems(searchTerm);
                                }).catch((e) => message.error("Errore nell'eliminazione: " + e))
                            }} />,
                        ]}
                    >
                        <List.Item.Meta
                            title={item.description}
                            description={`Prezzo Unitario: €${item.unit_price.toFixed(2)}`}
                        />
                    </List.Item>
                ))
                    : null}
        </List>
    </>
}
