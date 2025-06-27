import { PlusOutlined } from '@ant-design/icons';
import { Button, List, Modal, Row, Typography } from 'antd';
import { useState } from 'react';
import { useDatabaseStore } from '../modules/state';
import { Maker } from '../types/database';
import ListWithSearch from './ListWithSearch';
export default function MakersModels() {
    const { makers, models } = useDatabaseStore((state) => state)
    const [selectedMaker, setSelectedMaker] = useState<Maker>();


    function close() {
        setSelectedMaker(undefined);
    }

    return <>
        <Modal
            title={`Modelli marchio ${selectedMaker?.name}`}
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={selectedMaker != undefined}
            onOk={close}
            onCancel={close}
            cancelText="Chiudi"
        >
            <List
                className='list'
                pagination={{ position: "bottom", align: "center", pageSize: 5 }}
                header={<Row justify={"space-between"} align="middle">
                    <Typography.Title level={5}>Modelli Disponibili</Typography.Title>
                    <Button icon={<PlusOutlined />} type='primary' />
                </Row>}
                bordered
                dataSource={models}
                renderItem={(item) => (
                    <List.Item className='item' onClick={() => {
                        setSelectedMaker(item);
                    }}>
                        {item.name}
                    </List.Item>
                )}
            />
        </Modal>

        <ListWithSearch
            dataSource={makers}
            title='Marche Disponibili'
            paramToRender='name'
            onItemClick={(item) => {
                setSelectedMaker(item);
            }} />
    </>
}