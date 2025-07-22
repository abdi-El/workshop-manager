import { Button, Form, Input, message } from "antd";
import FormItem from "antd/es/form/FormItem";
import dayjs from "dayjs";
import { useEffect } from "react";
import { getKeyType, validateKey } from "../modules/activator";
import { useStore } from "../modules/state";

interface FormType {
    activationKey: string
}

export default function ActivationKeyForm() {
    const [form] = Form.useForm<FormType>()
    const { settings, updateSettings } = useStore((state) => state)

    function onFinish(data: FormType) {
        const { activationKey } = data

        if (validateKey(activationKey)) {
            const keyType = getKeyType(activationKey as any)
            if (settings.activationKey && keyType == "DEMO") {
                message.error("Non è possibile ri-inserire una chiave demo")
                return
            }
            message.success("Chiave inserita con successo")
            updateSettings({ activationDate: dayjs(), activationKey })
        } else {
            message.error("Chiave non valida")
        }

    }

    useEffect(() => {
        form.setFieldValue("activationKey", settings.activationKey)
    }, [settings.activationKey])

    return <Form form={form} name="activationKeyForm" onFinish={onFinish}>
        <FormItem name="activationKey" rules={[{ required: true }]} label={"Chiave:"}>
            <Input maxLength={20} placeholder="Inserire chiave di attivazione" />
        </FormItem>
        <FormItem name={null}>
            <Button htmlType="submit" className="w-100" type="primary" >Verfica Chiave</Button>
        </FormItem>
    </Form>
}