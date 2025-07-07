import { Button, DatePicker, Form, TimePicker } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { create, db, update } from "../../modules/database";
import { DATE_FORMAT, TIME_FORMAT } from "../../modules/dates";
import { useDatabaseStore, useStore } from "../../modules/state";
import { Appointment, Estimate } from "../../types/database";
import CarSelect from "../selects/CarSelect";
import CustomerSelect from "../selects/CustomerSelect";
import DatabasResourceSelect from "../selects/DatabaseResourceSelect";


interface Props {
    estimateId?: Estimate["id"]
    appointmentId?: Appointment["id"]
}



export default function AppointmentForm({ estimateId, appointmentId }: Props) {
    const [form] = Form.useForm()
    const { updateDatabaseData } = useDatabaseStore((state) => state)
    const { settings } = useStore(state => state)
    const selectedEstimate = Form.useWatch("estimate_id", form)

    useEffect(() => {
        if (appointmentId) {
            db.select(`SELECT * FROM appointments WHERE id = ${appointmentId}`).then((res: any) => {
                if ((res as Appointment[]).length) {
                    const data = res[0]
                    form.setFieldsValue({
                        ...data,
                        date: dayjs(data.date, DATE_FORMAT),
                        from_time: dayjs(data.from_time, TIME_FORMAT),
                        to_time: dayjs(data.to_time, TIME_FORMAT),
                    })
                }
            })
        }
    }, [appointmentId])

    function formatData(data: Appointment) {
        const date = dayjs(data.date).format(DATE_FORMAT)
        const startTime = dayjs(data.from_time).format(TIME_FORMAT)
        const endTime = dayjs(data.to_time).format(TIME_FORMAT)
        return {
            ...data,
            date,
            "from_time": startTime,
            "to_time": endTime,
            "workshop_id": settings.selectedWorkshop?.id,
            "estimate_id": selectedEstimate
        }
    }

    function onFinish(values: Appointment) {
        const formattedData = formatData(values)
        const onExecute = () => updateDatabaseData(["appointments", "estimates"])
        const table = "appointments"
        if (appointmentId) {
            update(formattedData, appointmentId, onExecute, table)
        } else {
            create(formattedData, onExecute, table)
        }
    }

    return <Form form={form} onFinish={onFinish}>
        {!estimateId &&
            <>
                <DatabasResourceSelect
                    resource="estimates"
                    selectLabel="id"
                    name="estimate_id"
                    inputLabel="Preventivo"
                    className="w-50"
                    allowClear
                    required={false}
                    rules={[{ required: false }]} />
                {!selectedEstimate && <>
                    <CustomerSelect />
                    <CarSelect />
                </>}
            </>
        }
        <Form.Item
            label="data"
            name="date"
            rules={[{ required: true, message: "Inserire la data" }]}
        >
            <DatePicker format={DATE_FORMAT} className="w-100" />
        </Form.Item>
        <Form.Item
            label="Inizio"
            name="from_time"
            rules={[{ required: true, message: "Inserire Inizio" }]}
        >
            <TimePicker needConfirm={false} format={TIME_FORMAT} />
        </Form.Item>
        <Form.Item
            label="Fine"
            name="to_time"
            rules={[{ required: true, message: "Inserire Fine" }]}
        >
            <TimePicker needConfirm={false} format={TIME_FORMAT} />
        </Form.Item>

        <Form.Item>
            <Button type="primary" htmlType="submit" className="w-100">
                {appointmentId ? "Aggiorna" : "Crea"} appuntamento
            </Button>
        </Form.Item>

    </Form>
}