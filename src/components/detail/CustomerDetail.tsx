import { WhatsAppOutlined } from "@ant-design/icons";
import { Button, Descriptions, Space, Tooltip } from "antd";
import { useIsMobile } from "../../modules/hooks";
import { Customer } from "../../types/database";

function whatsappUrl(phone: string) {
    const digits = phone.replace(/\D/g, "");
    const number = digits.startsWith("39") ? digits : `39${digits}`;
    return `https://wa.me/${number}`;
}

export default function CustomerDetail({ customer }: { customer: Customer }) {
    const isMobile = useIsMobile();
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
                                href={whatsappUrl(customer.phone)}
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
