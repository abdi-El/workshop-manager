import { Form } from "antd";
import DatabasResourceSelect from "./DatabaseResourceSelect";
interface Props extends React.ComponentProps<typeof Form.Item> { }

export default function CarSelect(props: Props) {
    return <DatabasResourceSelect {...props} resource="cars" selectLabel="id" name="car_id" inputLabel="Auto" />
}