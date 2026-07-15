import { isTauri } from "../utils";
import { DatabaseService } from "./DatabaseService";

let dbInstance: DatabaseService;

export async function initDatabaseService(): Promise<DatabaseService> {
    if (isTauri()) {
        const { LocalDatabase } = await import("./LocalDatabase");
        const local = new LocalDatabase();
        await local.init();
        dbInstance = local;
    } else {
        const { RemoteDatabase } = await import("./RemoteDatabase");
        dbInstance = new RemoteDatabase(window.location.origin + "/api");
    }
    return dbInstance;
}

export function getDb(): DatabaseService {
    if (!dbInstance) throw new Error("Database not initialized");
    return dbInstance;
}
