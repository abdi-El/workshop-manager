import { Form } from "antd";
import { useEffect, useState } from "react";
import { Car } from "../../types/database";
import DatabasResourceSelect from "./DatabaseResourceSelect";
interface Props extends React.ComponentProps<typeof Form.Item> {
    customerId?: number
}

export default function CarSelect({ customerId, ...props }: Props) {
    const [updatedProps, setUpdatedProps] = useState({
        ...props,
        filterFunc: undefined as any,
    })
    useEffect(() => {
        if (customerId) {
            setUpdatedProps(prev => { return { ...prev, filterFunc: (el: Car) => el.customer_id == customerId } })
        }
    }, [customerId])

    return <DatabasResourceSelect {...updatedProps} resource="cars" selectLabel="id" name="car_id" inputLabel="Auto" />
}