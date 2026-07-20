import { Form, Modal } from "antd";
import { useEffect, useState } from "react";
import { Car } from "../../types/database";
import CarsForm from "../forms/CarsForm";
import DatabasResourceSelect from "./DatabaseResourceSelect";

export default function CarSelect(props: React.ComponentProps<typeof Form.Item>) {
    const form = Form.useFormInstance()
    const [open, setIsOpen] = useState(false)
    const [refreshToken, setRefreshToken] = useState(0)
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
            <CarsForm defaultCustomerId={customerId} onSubmit={(_values, newId) => {
                setIsOpen(false)
                setRefreshToken(token => token + 1)
                if (newId) form.setFieldValue("car_id", newId)
            }} />
        </Modal>
        <DatabasResourceSelect {...updatedProps} resource="cars" selectLabel="car_info" name="car_id" inputLabel="Auto" refreshToken={refreshToken} autoSelectSingle onAddClick={() => {
            setIsOpen(true)
        }} />
    </>
}