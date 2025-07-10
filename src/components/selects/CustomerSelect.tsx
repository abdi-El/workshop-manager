import { Modal } from "antd";
import { useState } from "react";
import CustomerForm from "../forms/CustomerForm";
import DatabasResourceSelect from "./DatabaseResourceSelect";

export default function CustomerSelect() {
    const [open, setOpen] = useState(false)

    function close() {
        setOpen(false)
    }

    return <>
        <Modal open={open} onCancel={close} footer={false}>
            <CustomerForm onSubmit={close} />
        </Modal>
        <DatabasResourceSelect resource="customers" selectLabel="name" name="customer_id" inputLabel="Cliente" onAddClick={() => {
            setOpen(true)
        }} />
    </>
}