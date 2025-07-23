import { Card, Col, Row } from "antd";
import { useEffect, useState } from "react";
import { checkActivation } from "../modules/activator";
import { useStore } from "../modules/state";
import ActivationKeyForm from "./ActivationKeyForm";

export default function ActivatorOverlay() {
    const { page, isDebug } = useStore((state) => state)
    const [isActive, setIsActive] = useState(true)

    async function updateActiveStatus() {
        setIsActive(await checkActivation())
    }

    useEffect(() => {
        updateActiveStatus()
    }, [page])

    return !isActive && !isDebug && <div className="activator"  >
        <Row className="h-100 w-100" align={"middle"} justify={"center"} >
            <Col span={18}>
                <Card title="Inserire chaive di attivazione" styles={{ "title": { textAlign: "center" } }}>
                    <ActivationKeyForm onSubmit={updateActiveStatus} />
                </Card>
            </Col>
        </Row>
    </div>
}