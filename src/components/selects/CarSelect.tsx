import { Form, Modal } from "antd";
import { useEffect, useState } from "react";
import { Car } from "../../types/database";
import CarsForm from "../forms/CarsForm";
import DatabasResourceSelect from "./DatabaseResourceSelect";

export default function CarSelect(props: React.ComponentProps<typeof Form.Item>) {
    const form = Form.useFormInstance()
    const [open, setIsOpen] = useState(false)
    const customerId = Form.useWatch("customer_id", form)
    const [updatedProps, setUpdatedProps] = useState({
        ...props,
        filterFunc: undefined as any,
    })

    function close() {
        setIsOpen(false)
    }

    useEffect(() => {
        if (customerId) {
            setUpdatedProps(prev => { return { ...prev, filterFunc: (el: Car) => el.customer_id == customerId } })
        }
    }, [customerId])

    return <>
        <Modal onCancel={close} open={open} footer={false}>
            <CarsForm onSubmit={() => setIsOpen(false)} />
        </Modal>
        <DatabasResourceSelect {...updatedProps} resource="cars" selectLabel="car_info" name="car_id" inputLabel="Auto" onAddClick={() => {
            setIsOpen(true)
        }} />
    </>
}