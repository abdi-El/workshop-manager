import { Descriptions, Space } from "antd";
import { getLogoUrl } from "../../modules/utils";
import { Car } from "../../types/database";

export default function CarDetail({ car }: { car: Car }) {
    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Marca">
                <Space>
                    {car.maker_name && <img
                        src={getLogoUrl(car.maker_name)}
                        alt={car.maker_name}
                        style={{ height: 24, maxWidth: 50, objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />}
                    {car.maker_name || "—"}
                </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Modello">{car.model_name || "—"}</Descriptions.Item>
            <Descriptions.Item label="Anno">{car.year}</Descriptions.Item>
            <Descriptions.Item label="Targa">{car.number_plate}</Descriptions.Item>
            <Descriptions.Item label="Ultima revisione">{car.last_inspection_date || "—"}</Descriptions.Item>
            <Descriptions.Item label="Note">{car.notes || "—"}</Descriptions.Item>
        </Descriptions>
    );
}
