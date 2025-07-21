import { message } from "antd";


// Configuration
const VALID_KEYS = {
    DEMO: "A7X9K2M4V1T6B8N3R5L0C7Q8W2Z1E6P",
    ALPHA: "J4T9W6Z8Q2L1M7X3R9B0C5E8V1N2K4A"
} as const;

// Types
type KeysType = keyof typeof VALID_KEYS;

// Custom Error
class KeyValidationError extends Error {
    constructor(message: string = "Invalid API key provided") {
        super(message);
        this.name = "KeyValidationError";
    }
}

// Validation functions
function validateKey(key: string): KeysType {
    for (const [keyType, validKey] of Object.entries(VALID_KEYS)) {
        if (key === validKey) {
            return keyType as KeysType;
        }
    }
    throw new KeyValidationError(`Key does not match any valid API key`);
}



export function getKeyType(key: string): KeysType | undefined {
    try {
        return validateKey(key);
    } catch (error) {
        if (error instanceof KeyValidationError)
            message.error("Chiave non valida")
        return undefined
    }
}
