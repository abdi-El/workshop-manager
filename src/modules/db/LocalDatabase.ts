import Database from "@tauri-apps/plugin-sql";
import { DatabaseService, QueryResult } from "./DatabaseService";

export class LocalDatabase extends DatabaseService {
    private db!: Awaited<ReturnType<typeof Database.load>>;

    async init() {
        this.db = await Database.load("sqlite:estimates.db");
        await this.db.execute("PRAGMA busy_timeout = 5000");
    }

    protected async select<T = any>(query: string, params?: any[]): Promise<T[]> {
        return this.db.select(query, params) as Promise<T[]>;
    }

    protected async execute(query: string, params?: any[]): Promise<QueryResult> {
        const result = await this.db.execute(query, params);
        return { lastInsertId: result.lastInsertId ?? 0, rowsAffected: result.rowsAffected };
    }

    protected async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
        await this.db.execute("BEGIN TRANSACTION");
        try {
            const result = await fn();
            await this.db.execute("COMMIT");
            return result;
        } catch (error) {
            try { await this.db.execute("ROLLBACK"); } catch (_) { /* already rolled back */ }
            throw error;
        }
    }
}
