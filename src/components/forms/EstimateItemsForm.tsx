import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Row } from 'antd';
import { useEffect } from 'react';

export default function EstimateItemsForm() {
    const form = Form.useFormInstance();
    const items = Form.useWatch('items', form);

    useEffect(() => {
        if (items && items.length > 0) {
            return;
        }
        form.setFieldsValue({
            items: [{}],
        });
    }, [form, items]);


    return <Form.List name="items">
        {(fields, { add, remove }) => {
            return <>
                {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} className='w-100' align="top">
                        <Col span={17}>
                            <Form.Item
                                {...restField}
                                name={[name, 'description']}
                                rules={[{ required: true, message: 'Inserire descrizione' }]}
                            >
                                <Input.TextArea className='w-100' placeholder="descrizione" />
                            </Form.Item >
                        </Col>
                        <Col span={3}>
                            <Form.Item
                                {...restField}
                                name={[name, 'quantity']}
                                rules={[{ required: true, message: 'Inserire quantità' }]}
                            >
                                <InputNumber placeholder="quantity" className='w-100' />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item
                                {...restField}
                                name={[name, 'unit_price']}
                                rules={[{ required: true, message: 'Inserire prezzo unitario' }]}
                            >
                                <InputNumber placeholder="Prezzo u." className='w-100' />
                            </Form.Item>
                        </Col>
                        <Col span={1}>
                            <Button icon={<MinusCircleOutlined />} disabled={items.length == 1} onClick={() => remove(name)} danger type='primary' />
                        </Col>
                    </Row >

                ))
                }
                <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} >
                        Aggiungi una voce
                    </Button>
                </Form.Item>
            </>
        }}
    </Form.List >

}


