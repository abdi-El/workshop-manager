import { Button, Col, Collapse, Empty, message, Row, Upload } from "antd";
import { FiUploadCloud } from "react-icons/fi";
import { useFile } from '../modules/hooks';
const { Panel } = Collapse;

const getContents = (file: File) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};


export default function BackupManager() {
    const backupConfig = useFile("backup_account.json")
    return (
        <div>
            <Collapse
            >
                <Panel header={
                    <Row >
                        <Col span={12}>
                            <Upload
                                onRemove={backupConfig.deleteFile}
                                onChange={async (info) => {
                                    const file = info.file.originFileObj;
                                    if (file) {
                                        const data = await getContents(file);
                                        backupConfig.write(data as string);
                                        message.success("File di configurazione caricato con successo");
                                    }
                                }}
                                fileList={backupConfig.fileExists ? [{ name: "backup_account.json", status: "done", uid: '2' }] : []}
                            >
                                <Button icon={<FiUploadCloud />}>Carica file di configurazione</Button>
                            </Upload>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            <Button disabled={!backupConfig.fileExists} loading={backupConfig.loading} onClick={() => {

                            }} type="primary">Esegui Backup</Button>
                        </Col>
                    </Row>
                } key="1" collapsible="disabled">
                    <Empty description="Nessun backup disponibile" />
                </Panel>

            </Collapse>
        </div>
    )
}