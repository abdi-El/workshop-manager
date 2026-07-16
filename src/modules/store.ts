import { load } from "@tauri-apps/plugin-store";

let storeSettings: Awaited<ReturnType<typeof load>>;

export async function initStore() {
    storeSettings = await load("settings.json");
}

export { storeSettings };
