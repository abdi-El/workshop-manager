import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Col, Form, InputNumber, Row } from 'antd';
import { useEffect, useState } from 'react';
import { useDebounce } from '../../modules/hooks';
import { searchDefaultEstimateItems } from '../../modules/queries';

interface DefaultItem { description: string; quantity: number | null; unit_price: number }

export default function EstimateItemsForm() {
    const form = Form.useFormInstance();
    const items = Form.useWatch('items', form);
    const [suggestions, setSuggestions] = useState<DefaultItem[]>([]);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 100);

    useEffect(() => {
        if (debouncedSearch.length < 2) { setSuggestions([]); return; }
        searchDefaultEstimateItems(debouncedSearch).then((rows) => {
            setSuggestions(rows as DefaultItem[]);
        });
    }, [debouncedSearch]);

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
                                    placeholder="descrizione"
                                    options={suggestions.map(s => ({ value: s.description, label: s.description }))}
                                    onSearch={setSearch}
                                    onSelect={(value) => {
                                        const match = suggestions.find(s => s.description === value);
                                        if (!match) return;
                                        const current = form.getFieldValue('items');
                                        current[name] = { description: value, quantity: match.quantity ?? 1, unit_price: match.unit_price };
                                        form.setFieldsValue({ items: [...current] });
                                    }}
                                />
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
