import { Button, Col, Input, List, message, Modal, Row } from "antd";
import { useEffect, useState } from "react";
import { getDb } from "../modules/db/instance";
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
        getDb().searchDefaultEstimateItems(query).then((rows) => {
            setItems(rows);
        }).catch((error) => {
            message.error("Errore nel recupero delle voci: " + error);
        });
    };

    useEffect(() => {
        loadItems(debouncedSearch);
    }, [debouncedSearch]);

    return <>
        <Modal title="Voci di default" open={open} onCancel={() => setOpen(false)} footer={null} width={"80%"}>
            <DefaultEstimateItemForm onSubmit={() => {
                setOpen(false);
                loadItems(searchTerm);
            }} item={selectedItem} />
        </Modal>
        <List header={
            <Row justify={"space-between"}>
                <Col span={19}>
                    <Input placeholder="Cerca per nome" value={searchTerm} onInput={(e) => {
                        setSearchTerm((e.target as HTMLInputElement).value)
                    }} />
                </Col>
                <Col span={5} style={{ textAlign: "right" }}>
                    <Button onClick={() => {
                        setSelectedItem(undefined);
                        setOpen(true)
                    }} type="primary">Aggiungi voce</Button>
                </Col>

            </Row>
        }>
            {
                items.length ? items.map(item => (
                    <List.Item key={item.id}>
                        <List.Item.Meta
                            title={item.description}
                            description={`Prezzo Unitario: €${item.unit_price.toFixed(2)}`}
                        />
                        <Button onClick={() => {
                            setSelectedItem(item)
                            setOpen(true)
                        }} type="dashed">Modifica</Button>
                        <DeleteButton onConfirm={() => {
                            getDb().deleteRow(item.id, "default_estimate_items").then(() => {
                                message.success("Eliminato con successo!");
                                loadItems(searchTerm);
                            }).catch((e) => message.error("Errore nell'eliminazione: " + e))
                        }} />
                    </List.Item>
                ))
                    : null}
        </List>
    </>
}
