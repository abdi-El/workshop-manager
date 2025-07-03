import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Descriptions, Popconfirm, Popover, Row, Tag } from "antd";
import { deleteRow } from "../modules/database";
import { AppointmentEventData } from "../types/database";


interface Props {
    appointment: AppointmentEventData
    onDelete: () => void
    onEdit: (app: AppointmentEventData) => void
}

const renderPopoverContent = (data: AppointmentEventData) => (
    <Descriptions
        size="small"
        column={1}
        bordered
        labelStyle={{ fontWeight: 600 }}
    >
        <Descriptions.Item label="Cliente">{data.customer_name}</Descriptions.Item>
        <Descriptions.Item label="Telefono">{data.customer_phone}</Descriptions.Item>
        <Descriptions.Item label="Auto">{data.car_info}</Descriptions.Item>
        <Descriptions.Item label="Targa">{data.number_plate}</Descriptions.Item>
        <Descriptions.Item label="Data">
            {data.date} ({data.from_time} - {data.to_time})
        </Descriptions.Item>
        <Descriptions.Item label="Preventivo">
            {data.estimate_status ? <Tag color="green">Creato</Tag> : <Tag color="orange">Da Creare</Tag>}
        </Descriptions.Item>
    </Descriptions>
);
export default function PlannerEvent({ appointment, onDelete, onEdit }: Props) {
    return <Popover
        title={
            <Row justify={"space-between"}>
                <div>
                    Appuntamento #{appointment.id}
                </div>
                <div>
                    <Button icon={<EditOutlined />} type={"primary"} style={{ marginRight: "2px" }} onClick={() => onEdit(appointment)} />
                    <Popconfirm
                        title="Elimina Appuntamento"
                        description="Sei sicuro di voler eliminare questo appuntamento?"
                        okText="Sì"
                        cancelText="No"
                        onConfirm={() => {
                            deleteRow(appointment.id, "appointments", () => {
                                onDelete()
                            })
                        }}
                    >
                        <Button icon={<DeleteOutlined />} danger type="primary" />
                    </Popconfirm>
                </div>

            </Row>
        }
        content={renderPopoverContent(appointment)}
        trigger={"click"}
    >
        <div className="h-100">{appointment.car_info}</div>
    </Popover>
}