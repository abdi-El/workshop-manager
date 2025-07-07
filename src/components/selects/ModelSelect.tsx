import { Form } from "antd";
import { useEffect, useState } from "react";
import { MakerModel } from "../../types/database";
import DatabasResourceSelect from "./DatabaseResourceSelect";
interface Props extends React.ComponentProps<typeof Form.Item> {
    makerId?: number
}

export default function ModelSelect(props: React.ComponentProps<typeof Form.Item>) {
    const form = Form.useFormInstance()
    const makerId = Form.useWatch("maker_id", form)
    const [updatedProps, setUpdatedProps] = useState({
        ...props,
        filterFunc: undefined as any,
    })
    useEffect(() => {
        if (makerId) {
            setUpdatedProps(prev => { return { ...prev, filterFunc: (el: MakerModel) => el.maker_id == makerId } })
        }
    }, [makerId])

    return <DatabasResourceSelect {...updatedProps} resource="models" selectLabel="name" name="model_id" inputLabel="Modello" />
}