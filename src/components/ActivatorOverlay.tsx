import { Button, Card, Col, Input, message, Row } from "antd";
import { useState } from "react";
import { getKeyType } from "../modules/activator";

export default function ActivatorOverlay() {
    const [value, setValue] = useState<string>()
    const [error, setError] = useState(false)
    function onClick() {
        if (value) {
            let keyType = getKeyType(value)
            if (keyType) {
                message.warning(keyType)
            }
            else {
                setError(true)
            }
        }
    }
    return <div className="activator"  >
        <Row className="h-100 w-100" align={"middle"} justify={"center"} >
            <Col span={18}>
                <Card title="Inserire chaive di attivazione" styles={{ "title": { textAlign: "center" } }}>
                    <Input status={error ? "error" : ""} style={{ marginBottom: "10px" }} onInput={(event) => {
                        if (error) {
                            setError(false)
                        }
                        setValue(event.currentTarget.value)
                    }} onKeyDown={(event) => {
                        if (event.key == "Enter") onClick()
                    }} maxLength={31} placeholder="Inserire chiave di attivazione" />
                    <Button className="w-100" type="primary" onClick={onClick} disabled={!value || value.length != 31}>Verfica Chiave</Button>
                </Card>
            </Col>
        </Row>
    </div>
}