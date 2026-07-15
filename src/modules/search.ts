import { getDb } from "./db/instance";

export type SearchResultType = "customer" | "car" | "estimate";

export interface SearchResult {
    type: SearchResultType;
    id: number;
    title: string;
    subtitle: string;
    page: "customers" | "cars" | "estimates";
}

export async function globalSearch(rawQuery: string): Promise<SearchResult[]> {
    return getDb().globalSearch(rawQuery);
}
