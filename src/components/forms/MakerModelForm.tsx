import { Button, Form, Input, message } from "antd";

interface FormType {
    name: string;
}

interface Props {
    isMaker: boolean;
    id?: number;
}

export default function MakerModelForm(props: Props) {
    const [form] = Form.useForm<FormType>();
    function onFinish(values: FormType) {
        message.success(
            `Form submitted successfully with ${props.isMaker ? "Maker" : "Model"}: ${values.name}`
        );
    }
    const makerOrModel = props.isMaker ? "Marchio" : "Modello";
    return (
        <Form form={form} layout="horizontal" onFinish={onFinish} style={{ marginTop: "20px" }}>
            <Form.Item label="Nome" name="makerName">
                <Input type="text" placeholder={`Inserisci nome ${makerOrModel}`} />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    {props.id ? "Aggiorna" : "Crea"} {makerOrModel}
                </Button>
            </Form.Item>
        </Form>
    );
}