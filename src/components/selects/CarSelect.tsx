import { Form } from "antd";
import { useEffect, useState } from "react";
import { Car } from "../../types/database";
import DatabasResourceSelect from "./DatabaseResourceSelect";

export default function CarSelect(props: React.ComponentProps<typeof Form.Item>) {
    const form = Form.useFormInstance()
    const customerId = Form.useWatch("customer_id", form)
    const [updatedProps, setUpdatedProps] = useState({
        ...props,
        filterFunc: undefined as any,
    })
    useEffect(() => {
        if (customerId) {
            setUpdatedProps(prev => { return { ...prev, filterFunc: (el: Car) => el.customer_id == customerId } })
        }
    }, [customerId])

    return <DatabasResourceSelect {...updatedProps} resource="cars" selectLabel="car_info" name="car_id" inputLabel="Auto" />
}