import { WhatsAppOutlined } from "@ant-design/icons";
import { Button, Descriptions, Space, Tooltip } from "antd";
import { useIsMobile } from "../../modules/hooks";
import { useStore } from "../../modules/state";
import { Customer } from "../../types/database";

function whatsappUrl(phone: string, message?: string) {
    const digits = phone.replace(/\D/g, "");
    const number = digits.startsWith("39") ? digits : `39${digits}`;
    const params = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${number}${params}`;
}

export default function CustomerDetail({ customer }: { customer: Customer }) {
    const isMobile = useIsMobile();
    const { settings } = useStore(state => state);
    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Nome">{customer.name}</Descriptions.Item>
            <Descriptions.Item label="Indirizzo">{customer.address || "—"}</Descriptions.Item>
            <Descriptions.Item label="Telefono">
                {customer.phone
                    ? <Space>
                        {isMobile
                            ? <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                            : customer.phone}
                        <Tooltip title="WhatsApp">
                            <Button
                                size="small"
                                type="link"
                                icon={<WhatsAppOutlined style={{ color: "#25D366" }} />}
                                href={whatsappUrl(customer.phone, settings.defaultWhatsappMessage)}
                                target="_blank"
                            />
                        </Tooltip>
                    </Space>
                    : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Email">{customer.email || "—"}</Descriptions.Item>
            <Descriptions.Item label="Lavori">{customer.estimate_count ?? 0}</Descriptions.Item>
            <Descriptions.Item label="Note">{customer.notes || "—"}</Descriptions.Item>
        </Descriptions>
    );
}
