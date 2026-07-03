import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Col, Form, Input, InputNumber, Row, Tag } from 'antd';
import { useState } from 'react';
import { searchEstimateItemSuggestions } from '../../modules/queries';

interface ItemSuggestion {
    description: string;
    unit_price: number;
    is_default: number;
}

export default function EstimateItemsForm() {
    const form = Form.useFormInstance();
    const items = Form.useWatch('items', form);
    const [mappedItems, setMappedItems] = useState<Record<string, ItemSuggestion>>({});

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
                                <AutoComplete
                                    className='w-100'
                                    options={Object.values(mappedItems).map(item => ({
                                        value: item.description,
                                        label: (
                                            <Row justify="space-between" align="middle" wrap={false}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {item.description} — € {item.unit_price}
                                                </span>
                                                {item.is_default ? <Tag color="blue" style={{ marginLeft: 8 }}>Default</Tag> : null}
                                            </Row>
                                        ),
                                    }))}
                                    onSelect={(val) => {
                                        const selectedItem = mappedItems[val];
                                        if (selectedItem) {
                                            form.setFieldValue(['items', name, 'unit_price'], selectedItem.unit_price);
                                        }
                                    }}
                                    onSearch={(val) => {
                                        const query = val.trim();
                                        if (!query) {
                                            setMappedItems({});
                                            return;
                                        }
                                        searchEstimateItemSuggestions(query).then((rows) => {
                                            setMappedItems((rows as ItemSuggestion[]).reduce((acc, item) => {
                                                acc[item.description] = item;
                                                return acc;
                                            }, {} as Record<string, ItemSuggestion>))
                                        }).catch(() => {
                                            setMappedItems({});
                                        })
                                    }}

                                >
                                    <Input.TextArea className='w-100' placeholder="descrizione" spellCheck lang="it" />
                                </AutoComplete>
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
