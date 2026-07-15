import { Estimate, EstimateItem } from "../../types/database";
import { DatabaseService, QueryResult } from "./DatabaseService";

export class RemoteDatabase extends DatabaseService {
    constructor(private baseUrl: string) {
        super();
    }

    protected async select<T = any>(query: string, params?: any[]): Promise<T[]> {
        const res = await fetch(`${this.baseUrl}/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, params }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }

    protected async execute(query: string, params?: any[]): Promise<QueryResult> {
        const res = await fetch(`${this.baseUrl}/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, params }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }

    protected async withTransaction<T>(_fn: () => Promise<T>): Promise<T> {
        throw new Error("Transactions not supported over HTTP — use dedicated endpoints");
    }

    async createOrUpdateEstimate(estimate: Estimate, items: EstimateItem[], estimateId?: number): Promise<void> {
        const res = await fetch(`${this.baseUrl}/estimates`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estimate, items, estimateId }),
        });
        if (!res.ok) throw new Error(await res.text());
    }
}
