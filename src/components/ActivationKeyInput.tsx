import { Button, Input, message } from "antd";
import { useState } from "react";

export default function ActivationKeyInput() {
    const [value, setValue] = useState<string>()
    const [error, setError] = useState(false)

    function onClick() {
        message.success(value)
    }
    return <>
        <Input status={error ? "error" : ""} style={{ marginBottom: "10px" }} onInput={(event) => {
            if (error) {
                setError(false)
            }
            setValue(event.currentTarget.value)
        }} onKeyDown={(event) => {
            if (event.key == "Enter") onClick()
        }} maxLength={31} placeholder="Inserire chiave di attivazione" />
        <Button className="w-100" type="primary" onClick={onClick} disabled={!value || value.length != 31}>Verfica Chiave</Button>
    </>
}