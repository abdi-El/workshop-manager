
export function isTauri() {
    return "__TAURI_INTERNALS__" in window;
}

export async function fetchIsDebug(): Promise<boolean> {
    if (isTauri()) {
        const { invoke } = await import("@tauri-apps/api/core");
        return invoke<boolean>("is_debug");
    }
    return fetch("/api/debug").then(r => r.json());
}

export function parseError(error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("UNIQUE")) {
        const field = msg.split(".");
        return [{
            name: field[field.length - 1],
            errors: ["Già esistente"],
        }]
    } return []
}

export function getLogoUrl(maker: string) {
    return `https://www.carlogos.org/car-logos/${maker.toLowerCase().replace(/\s+/g, '-')}-logo.png`
}