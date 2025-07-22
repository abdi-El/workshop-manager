import dayjs from "dayjs"
import { SettingsType } from "../types/common"
import { storeSettings } from "./database"

const KEYS = {
    "DEMO2025ABCD1234EFGH": "DEMO",
    "FULL2025WXYZ9876KLMN": "FULL"
}


// Validation functions
export function validateKey(key: string): boolean {
    return key in KEYS
}

export function getKeyType(key: keyof typeof KEYS): string | undefined {
    if (validateKey(key)) {
        return KEYS[key]
    }
    return undefined
}

export async function checkActivation() {
    const settings = await storeSettings.get('settings') as SettingsType
    if (settings.activationKey && settings.activationDate) {
        const keyType = getKeyType(settings.activationKey as any)
        if (keyType == "DEMO") {
            const activationDate = dayjs(settings.activationDate).subtract(3, 'day');
            return dayjs().diff(activationDate, "day") < 30
        }
        return true

    }
    return false
}