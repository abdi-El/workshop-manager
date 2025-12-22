import { Button, Col, Input, List, Modal, Row } from "antd";
import { useState } from "react";
import { deleteRow } from "../modules/database";
import { useDatabaseStore } from "../modules/state";
import { EstimateDefaultItem } from "../types/database";
import DeleteButton from "./buttons/DeleteButton";
import DefaultEstimateItemForm from "./forms/DefaultEstimateItemForm";

export default function DefaultEstimateItems() {
    const [open, setOpen] = useState(false);
    const { default_estimate_items, updateDatabaseData } = useDatabaseStore((state) => state)
    const [selectedItem, setSelectedItem] = useState<EstimateDefaultItem>();
    const [searchTerm, setSearchTerm] = useState("");

    return <>
        <Modal title="Voci di default" open={open} onCancel={() => setOpen(false)} footer={null} width={"80%"}>
            <DefaultEstimateItemForm onSubmit={() => {
                setOpen(false);
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
                default_estimate_items.length ? default_estimate_items.filter(i => i.description.toLowerCase().includes(searchTerm)).map(item => (
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
                            deleteRow(item.id, "default_estimate_items", () => {
                                updateDatabaseData(["default_estimate_items"])
                            })
                        }} />
                    </List.Item>
                ))
                    : null}
        </List>
    </>
}