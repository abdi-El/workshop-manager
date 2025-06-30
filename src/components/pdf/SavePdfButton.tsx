import { pdf, } from "@react-pdf/renderer";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { Button } from "antd";
import EstimatePdf from "./EstimatePdf";

export default function SaveEstimatePdf() {
    async function savePdf() {
        const path = await save({
            filters: [{ name: "PDF", extensions: ["pdf"] }],
        });
        if (!path) {
            return;
        }
        const blob = await pdf(
            <EstimatePdf />
        ).toBlob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        await writeFile(path, uint8Array);

    }

    return <Button onClick={savePdf} >Salva</Button>;
}