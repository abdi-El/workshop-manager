import { EditOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { ButtonProps } from "antd/lib";


export default function EditButton(props: ButtonProps) {
    return <Button  {...props} icon={<EditOutlined />} type="primary" />
}