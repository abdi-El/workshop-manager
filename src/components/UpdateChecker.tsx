import { Modal, Progress, Typography } from "antd";
import { useEffect, useState } from "react";
import { isTauri } from "../modules/utils";

export default function UpdateChecker() {
    const [progress, setProgress] = useState<number>();

    useEffect(() => {
        if (!isTauri()) return;
        checkUpdate();
    }, []);

    async function checkUpdate() {
        const { check } = await import("@tauri-apps/plugin-updater");
        const update = await check().catch(() => null);
        if (!update) return;

        Modal.confirm({
            title: "Aggiornamento disponibile",
            content: `Versione ${update.version} disponibile. Vuoi aggiornare ora?`,
            okText: "Aggiorna",
            cancelText: "Più tardi",
            onOk: async () => {
                setProgress(0);
                let total = 0;
                let downloaded = 0;
                await update.downloadAndInstall((event) => {
                    if (event.event === "Started" && event.data.contentLength) {
                        total = event.data.contentLength;
                    } else if (event.event === "Progress") {
                        downloaded += event.data.chunkLength;
                        if (total > 0) setProgress(Math.round((downloaded / total) * 100));
                    } else if (event.event === "Finished") {
                        setProgress(100);
                    }
                });
                const { relaunch } = await import("@tauri-apps/plugin-process");
                await relaunch();
            },
        });
    }

    if (progress === undefined) return null;

    return (
        <Modal open closable={false} footer={null} title="Aggiornamento in corso...">
            <Progress percent={progress} status={progress < 100 ? "active" : "success"} />
            <Typography.Text type="secondary">Non chiudere l'applicazione</Typography.Text>
        </Modal>
    );
}
