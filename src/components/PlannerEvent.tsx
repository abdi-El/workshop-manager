import { Descriptions, Popover, Row, Tag } from "antd";
import { deleteRow } from "../modules/database";
import { useDatabaseStore } from "../modules/state";
import { AppointmentEventData } from "../types/database";
import DeleteButton from "./buttons/DeleteButton";
import EditButton from "./buttons/EditButton";


interface Props {
    appointment: AppointmentEventData
    onDelete: () => void
    onEdit: (app: AppointmentEventData) => void
}


export default function PlannerEvent({ appointment, onDelete, onEdit }: Props) {
    const { updateDatabaseData } = useDatabaseStore(state => state)
    return <Popover
        title={
            <Row justify={"space-between"}>
                <div>
                    Appuntamento #{appointment.id}
                </div>
                <div>
                    <EditButton style={{ marginRight: "2px" }} onClick={() => onEdit(appointment)} />
                    <DeleteButton onConfirm={() => {
                        deleteRow(appointment.id, "appointments", () => {
                            onDelete()
                            updateDatabaseData(["estimates", "appointments"])
                        })
                    }} />
                </div>
            </Row>
        }
        content={<Descriptions
            size="small"
            column={1}
            bordered
            labelStyle={{ fontWeight: 600 }}
        >
            <Descriptions.Item label="Cliente">{appointment.customer_name}</Descriptions.Item>
            <Descriptions.Item label="Telefono">{appointment.customer_phone}</Descriptions.Item>
            <Descriptions.Item label="Auto">{appointment.car_info}</Descriptions.Item>
            <Descriptions.Item label="Targa">{appointment.number_plate}</Descriptions.Item>
            <Descriptions.Item label="Data">
                {appointment.date} ({appointment.from_time} - {appointment.to_time})
            </Descriptions.Item>
            <Descriptions.Item label="Preventivo">
                {appointment.estimate_status ? <Tag color="green">Creato</Tag> : <Tag color="orange">Da Creare</Tag>}
            </Descriptions.Item>
        </Descriptions>}
        trigger={"click"}
    >
        <div className="h-100">{appointment.car_info}</div>
    </Popover>
}