import { Button, DatePicker, Form, TimePicker } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { create, db } from "../../modules/database";
import { useDatabaseStore, useStore } from "../../modules/state";
import { Appointment, Estimate } from "../../types/database";
import DatabasResourceSelect from "../selects/DatabaseResourceSelect";


interface Props {
    estimateId?: Estimate["id"]
    appointmentId?: Appointment["id"]
}

const format = 'HH:mm';

export default function AppointmentForm({ estimateId, appointmentId }: Props) {
    const [form] = Form.useForm()
    const { updateDatabaseData } = useDatabaseStore((state) => state)
    const { settings } = useStore(state => state)
    const selectedEstimate = Form.useWatch("estimate_id")

    useEffect(() => {
        if (appointmentId) {
            db.select(`SELECT * FROM appointments WHERE id = ${appointmentId}`).then((res: any) => {
                if ((res as Appointment[]).length) {
                    const data = res[0]
                    form.setFieldsValue({
                        ...data,
                        date: dayjs(data.date, "DD-MM-YYYY"),
                        from_time: dayjs(data.from_time, "HH:MM"),
                        to_time: dayjs(data.to_time, "HH:MM"),
                    })
                }
            })
        }
    }, [appointmentId])

    function formatData(data: Appointment) {
        const HOUR_FORMAT = "HH:mm"
        const date = dayjs(data.date).format("DD-MM-YYYY")
        const startTime = dayjs(data.from_time).format(HOUR_FORMAT)
        const endTime = dayjs(data.to_time).format(HOUR_FORMAT)
        return {
            ...data,
            date,
            "from_time": startTime,
            "to_time": endTime,
            "workshop_id": settings.selectedWorkshop?.id,
            "estimate_id": estimateId
        }
    }

    function onFinish(values: Appointment) {
        create(formatData(values), () => {
            updateDatabaseData(["appointments", "estimates"])
        }, "appointments")
    }
    return <Form form={form} onFinish={onFinish}>
        {!estimateId &&
            <>
                <DatabasResourceSelect resource="estimates" selectLabel="id" name="estimate_id" inputLabel="Preventivo" className="w-50" allowClear />
                {!selectedEstimate && <>
                    <DatabasResourceSelect resource="cars" selectLabel="id" name="car_id" inputLabel="Auto" className="w-50" />
                    <DatabasResourceSelect resource="customers" selectLabel="id" name="customer_id" inputLabel="Cliente" className="w-50" />
                </>}
            </>
        }
        <Form.Item
            label="data"
            name="date"
            rules={[{ required: true, message: "Inserire la data" }]}
        >
            <DatePicker format="DD/MM/YYYY" className="w-100" />
        </Form.Item>
        <Form.Item
            label="Inizio"
            name="from_time"
            rules={[{ required: true, message: "Inserire Inizio" }]}
        >
            <TimePicker format={format} />
        </Form.Item>
        <Form.Item
            label="Fine"
            name="to_time"
            rules={[{ required: true, message: "Inserire Fine" }]}
        >
            <TimePicker format={format} />
        </Form.Item>

        <Form.Item>
            <Button type="primary" htmlType="submit" className="w-100">
                {appointmentId ? "Aggiorna" : "Crea"} appuntamento
            </Button>
        </Form.Item>

    </Form>
}