import { Button, Form, Input, message } from "antd";
import FormItem from "antd/es/form/FormItem";

export default function ActivationKeyInput() {
    const [form] = Form.useForm()
    function onFinish({ activationKey }: { activationKey: string }) {
        message.success(activationKey)
    }
    return <>
        <Form form={form} name="activator" onFinish={onFinish}>
            <FormItem name="activationKey" rules={[{ required: true }]} label={"Chiave:"}>
                <Input maxLength={31} placeholder="Inserire chiave di attivazione" />
            </FormItem>
            <FormItem name={null}>
                <Button htmlType="submit" className="w-100" type="primary" >Verfica Chiave</Button>
            </FormItem>
        </Form>
    </>
}