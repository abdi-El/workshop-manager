import { EyeOutlined, SaveOutlined } from "@ant-design/icons";
import { pdf, PDFViewer, } from "@react-pdf/renderer";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { Button, Modal } from "antd";
import { useEffect, useState } from "react";
import { useDatabaseStore } from "../../modules/state";
import EstimatePdf, { DataProps } from "./EstimatePdf";
import MissingDataPdf from "./MissingDataPdf";

interface Props {
    estimateId: number;
}

export default function SaveEstimatePdf({ estimateId }: Props) {
    const [rendered, setRendered] = useState(false);
    const state = useDatabaseStore(state => state);
    const [data, setData] = useState<DataProps | null>(null);

    function findData(estimateId: number): DataProps | null {
        const estimate = state.estimates.find(e => e.id === estimateId);
        if (!estimate) {
            return null;
        }
        const car = state.cars.find(c => c.id === estimate.car_id);
        const customer = state.customers.find(c => c.id === estimate.customer_id);
        const workshop = state.workshops.find(w => w.id === estimate.workshop_id);

        if (!car || !customer || !workshop) {
            return null;
        }
        return {
            estimate,
            car,
            customer,
            workshop
        }
    }
    useEffect(() => {
        setData(findData(estimateId));
    }, [estimateId, state]);

    async function savePdf() {
        const path = await save({
            filters: [{ name: "PDF", extensions: ["pdf"] }],
        });
        if (!path) {
            return;
        }
        const blob = await pdf(
            data ? <EstimatePdf {...data} /> : <MissingDataPdf />
        ).toBlob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        await writeFile(path, uint8Array);

    }

    return <>
        <Button onClick={savePdf} icon={<SaveOutlined />} />
        <Button onClick={() => setRendered(true)} icon={<EyeOutlined />} />
        <Modal open={rendered} onCancel={() => setRendered(false)} footer={null} title="Anteprima PDF" centered width="85%">
            {rendered && <PDFViewer style={{ width: "100%", height: "100vh" }} >
                {data ? <EstimatePdf {...data} /> : <MissingDataPdf />}
            </PDFViewer>}
        </Modal>

    </>
}