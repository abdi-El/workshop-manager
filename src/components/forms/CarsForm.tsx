import { Button, DatePicker, Form, Input } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { create, update } from "../../modules/database";
import { OLDEST_CAR_YEAR, transofrmYear } from "../../modules/dates";
import { useDatabaseStore, useStore } from "../../modules/state";
import { Car } from "../../types/database";
import CustomerSelect from "../selects/CustomerSelect";
import DatabasResourceSelect from "../selects/DatabaseResourceSelect";
import ModelSelect from "../selects/ModelSelect";

type CarFormProps = {
    car?: Partial<Car>;
    onSubmit: (values: Omit<Car, "id">) => void;
};

export default function CarsForm({ car, onSubmit }: CarFormProps) {
    const [form] = Form.useForm();
    const { updateDatabaseData } = useDatabaseStore((state) => state)
    const selectedMaker = Form.useWatch("maker_id", form)

    const { settings } = useStore((state) => state);

    const handleFinish = (values: Omit<Car, "id">) => {
        let data = {
            ...values,
            year: transofrmYear(values.year),
            number_plate: values.number_plate.toUpperCase(),
            "workshop_id": settings.selectedWorkshop?.id
        }
        if (!car?.id) {
            create(data, () => {
                form.resetFields();
                updateDatabaseData(["cars"]);
                onSubmit(values);
            }, "cars");
        } else {
            update(data, car.id, () => {
                form.resetFields();
                updateDatabaseData(["cars"]);
                onSubmit(values);
            }, "cars");
        }
    };

    useEffect(() => {
        if (car) {
            form.setFieldsValue({ ...car, year: transofrmYear(car.year as number) });
        } else {
            form.resetFields()
        }
    }, [car]);

    useEffect(() => {
        if (car && car.maker_id == selectedMaker) {
            form.setFieldValue("model_id", car.model_id)
        } else {
            form.setFieldValue("model_id", undefined)
        }

    }, [selectedMaker, car])

    return (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
            <CustomerSelect />
            <DatabasResourceSelect resource="makers" selectLabel="name" name="maker_id" inputLabel="Marca" />
            <ModelSelect />
            <Form.Item
                label="Anno"
                name="year"
                rules={[{ required: true, message: "Inserire il l'anno" }]}
            >
                <DatePicker picker="year" disabledDate={(current) => {
                    const year = current.year();
                    return year > dayjs().year() || year < OLDEST_CAR_YEAR;
                }}
                />
            </Form.Item>
            <Form.Item
                label="Targa"
                name="number_plate"
                rules={[{ required: true, message: "Inserire la targa" }]}
            >
                <Input style={{ textTransform: 'uppercase' }} />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    {car?.id ? "Aggiorna" : "Crea"} Auto
                </Button>
            </Form.Item>
        </Form>
    );
};

