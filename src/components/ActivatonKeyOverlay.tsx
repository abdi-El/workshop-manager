import { Card, Col, Row } from "antd";
import ActivationKeyInput from "./ActivationKeyInput";

export default function ActivatorOverlay() {

    return <div className="activator"  >
        <Row className="h-100 w-100" align={"middle"} justify={"center"} >
            <Col span={18}>
                <Card title="Inserire chaive di attivazione" styles={{ "title": { textAlign: "center" } }}>
                    <ActivationKeyInput />
                </Card>
            </Col>
        </Row>
    </div>
}