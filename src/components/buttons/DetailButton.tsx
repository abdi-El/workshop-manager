import { EyeOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { ButtonProps } from "antd/lib";

export default function DetailButton(props: ButtonProps) {
    return <Button {...props} icon={<EyeOutlined />} />
}
