import { Descriptions, Space } from "antd";
import { getLogoUrl } from "../../modules/utils";
import { Estimate } from "../../types/database";

export default function EstimateDetail({ estimate }: { estimate: Estimate }) {
    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Data">{estimate.date}</Descriptions.Item>
            <Descriptions.Item label="Cliente">{estimate.customer_name || "—"}</Descriptions.Item>
            <Descriptions.Item label="Targa">{estimate.car_number_plate || "—"}</Descriptions.Item>
            <Descriptions.Item label="Marca">
                <Space>
                    {estimate.maker_name && <img
                        src={getLogoUrl(estimate.maker_name)}
                        alt={estimate.maker_name}
                        style={{ height: 24, maxWidth: 50, objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />}
                    {estimate.maker_name || "—"}
                </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Km">{estimate.car_kms ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Ore lavoro">{estimate.labor_hours}</Descriptions.Item>
            <Descriptions.Item label="Costo orario">€ {estimate.labor_hourly_cost}</Descriptions.Item>
            <Descriptions.Item label="Sconto">{estimate.discount ? `€ ${estimate.discount}` : "—"}</Descriptions.Item>
            <Descriptions.Item label="IVA">{estimate.has_iva ? "Inclusa" : "Esclusa"}</Descriptions.Item>
            <Descriptions.Item label="Totale">
                € {(estimate.total ?? 0).toFixed(2)}{!estimate.has_iva ? " + IVA" : ""}
            </Descriptions.Item>
            <Descriptions.Item label="Note">{estimate.notes || "—"}</Descriptions.Item>
        </Descriptions>
    );
}
