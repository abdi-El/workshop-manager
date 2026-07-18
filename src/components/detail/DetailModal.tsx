import { Modal } from "antd";
import { ReactNode } from "react";
import { useIsMobile } from "../../modules/hooks";

interface DetailModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    footer: ReactNode;
    children: ReactNode;
}

export default function DetailModal({ open, onClose, title, footer, children }: DetailModalProps) {
    const isMobile = useIsMobile();
    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={title}
            footer={footer}
            width={isMobile ? "100%" : 600}
        >
            {children}
        </Modal>
    );
}
