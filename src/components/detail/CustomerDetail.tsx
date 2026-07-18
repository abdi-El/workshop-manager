import { Descriptions } from "antd";
import { useIsMobile } from "../../modules/hooks";
import { Customer } from "../../types/database";

export default function CustomerDetail({ customer }: { customer: Customer }) {
    const isMobile = useIsMobile();
    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Nome">{customer.name}</Descriptions.Item>
            <Descriptions.Item label="Indirizzo">{customer.address || "—"}</Descriptions.Item>
            <Descriptions.Item label="Telefono">
                {customer.phone
                    ? isMobile
                        ? <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                        : customer.phone
                    : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Email">{customer.email || "—"}</Descriptions.Item>
            <Descriptions.Item label="Note">{customer.notes || "—"}</Descriptions.Item>
        </Descriptions>
    );
}
