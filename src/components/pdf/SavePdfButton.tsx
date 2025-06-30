import { EyeOutlined, SaveOutlined } from "@ant-design/icons";
import { pdf, PDFViewer, } from "@react-pdf/renderer";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { Button, Modal } from "antd";
import { useState } from "react";
import EstimatePdf from "./EstimatePdf";

interface Props {
    estimateId: number;
}

export default function SaveEstimatePdf(props: Props) {
    const [rendered, setRendered] = useState(false);
    async function savePdf() {
        const path = await save({
            filters: [{ name: "PDF", extensions: ["pdf"] }],
        });
        if (!path) {
            return;
        }
        const blob = await pdf(
            <EstimatePdf {...props} />
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
                <EstimatePdf {...props} />
            </PDFViewer>}
        </Modal>

    </>
}