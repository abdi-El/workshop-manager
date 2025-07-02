import { Modal } from 'antd';
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
            title={`Modelli`}
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={selectedMaker != undefined}
            onOk={close}
            onCancel={close}
            cancelText="Chiudi"
        >
            <ListWithSearch
                dataSource={models.filter(model => model.maker_id === selectedMaker?.id)}
                title={`${selectedMaker?.name}`}
                paramToRender='name'
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