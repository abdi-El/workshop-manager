
export function parseError(error: string) {
    if (error.includes("UNIQUE")) {
        const field = error.split(".");
        return [{
            name: field[field.length - 1],
            errors: ["Già esistente"],
        }]
    } return []
}

