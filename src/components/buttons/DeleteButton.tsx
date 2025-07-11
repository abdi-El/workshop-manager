import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm } from "antd";
import { ButtonProps } from "antd/lib";
interface Props extends ButtonProps {
    onConfirm?: () => void
}
export default function DeleteButton({ onConfirm, ...props }: Props) {
    return <Popconfirm
        title="Elimina"
        description="Sei sicuro di voler eliminare?"
        okText="Sì"
        cancelText="No"
        onConfirm={onConfirm}
    >
        <Button {...props} icon={<DeleteOutlined />} danger type="primary" />
    </Popconfirm>

}