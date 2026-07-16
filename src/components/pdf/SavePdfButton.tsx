import { EyeOutlined, SaveOutlined } from "@ant-design/icons";
import { pdf, PDFViewer, } from "@react-pdf/renderer";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { Button, message, Modal } from "antd";
import { useState } from "react";
import { api } from "../../modules/api";
import { useStore } from "../../modules/state";
import { EstimateItem } from "../../types/database";
import EstimatePdf, { DataProps } from "./EstimatePdf";
import MissingDataPdf from "./MissingDataPdf";

interface Props {
    estimateId: number;
}

export default function SaveEstimatePdf({ estimateId }: Props) {
    const [rendered, setRendered] = useState(false);
    const { settings } = useStore(state => state);
    const [data, setData] = useState<DataProps | null>(null);
    const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);

    async function loadData() {
        const [pdfData, items] = await Promise.all([
            api.getEstimatePdfData(estimateId),
            api.getEstimateItems(estimateId),
        ]);
        setData(pdfData as any);
        setEstimateItems(items);
        return { pdfData, items };
    }

    async function savePdf() {
        const path = await save({
            filters: [{ name: "PDF", extensions: ["pdf"] }],
        });
        if (!path) {
            return;
        }
        const { pdfData, items } = await loadData();
        if (!pdfData) {
            message.warning("Dati mancanti per generare il PDF");
            return;
        }

        const blob = await pdf(
            <EstimatePdf {...pdfData as any} items={items as EstimateItem[]} pdfTheme={settings.pdfTheme} showPdfNumber={settings.showPdfNumber} />
        ).toBlob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        await writeFile(path, uint8Array);

    }

    return <>
        <Button onClick={savePdf} icon={<SaveOutlined />} />
        <Button onClick={() => { loadData(); setRendered(true); }} icon={<EyeOutlined />} />
        <Modal open={rendered} onCancel={() => setRendered(false)} footer={null} title="Anteprima PDF" centered width="85%">
            {rendered && <PDFViewer style={{ width: "100%", height: "100vh" }} >
                {data ? <EstimatePdf {...data} items={estimateItems} pdfTheme={settings.pdfTheme} showPdfNumber={settings.showPdfNumber} /> : <MissingDataPdf />}
            </PDFViewer>}
        </Modal>

    </>
}