import { api } from "./api";

export type SearchResultType = "customer" | "car" | "estimate";

export interface SearchResult {
    type: SearchResultType;
    id: number;
    title: string;
    subtitle: string;
    page: "customers" | "cars" | "estimates";
    phone?: string;
}

export async function globalSearch(rawQuery: string, workshopId?: number): Promise<SearchResult[]> {
    return api.globalSearch(rawQuery, workshopId);
}
