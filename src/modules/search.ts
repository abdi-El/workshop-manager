import { Car, Customer, Estimate } from "../types/database";

export type SearchResultType = "customer" | "car" | "estimate";

export interface SearchResult {
    type: SearchResultType;
    id: number;
    title: string;
    subtitle: string;
    page: "customers" | "cars" | "estimates";
}

const MAX_RESULTS_PER_GROUP = 8;

// Campi extra prodotti dalle query con join (carQuery / estimatesQuery)
type CarRow = Car & { car_info?: string };
type EstimateRow = Estimate & {
    customer_name?: string;
    car_number_plate?: string;
    estimate_info?: string;
};

function matches(query: string, ...fields: (string | number | null | undefined)[]): boolean {
    return fields.some((field) => field?.toString().toLowerCase().includes(query));
}

export function globalSearch(
    rawQuery: string,
    data: { customers: Customer[]; cars: Car[]; estimates: Estimate[] }
): SearchResult[] {
    const query = rawQuery.trim().toLowerCase();
    if (!query) return [];

    const customers: SearchResult[] = data.customers
        .filter((c) => matches(query, c.name, c.phone, c.email, c.address))
        .slice(0, MAX_RESULTS_PER_GROUP)
        .map((c) => ({
            type: "customer",
            id: c.id,
            title: c.name,
            subtitle: [c.phone, c.email].filter(Boolean).join(" · "),
            page: "customers",
        }));

    const cars: SearchResult[] = (data.cars as CarRow[])
        .filter((c) => matches(query, c.number_plate, c.maker_name, c.model_name, c.car_info))
        .slice(0, MAX_RESULTS_PER_GROUP)
        .map((c) => ({
            type: "car",
            id: c.id,
            title: c.number_plate,
            subtitle: [c.maker_name, c.model_name, c.year].filter(Boolean).join(" "),
            page: "cars",
        }));

    const estimates: SearchResult[] = (data.estimates as EstimateRow[])
        .filter((e) => matches(query, e.customer_name, e.car_number_plate, e.date, e.estimate_info))
        .slice(0, MAX_RESULTS_PER_GROUP)
        .map((e) => ({
            type: "estimate",
            id: e.id,
            title: [e.date, e.car_number_plate].filter(Boolean).join(" · "),
            subtitle: (e as EstimateRow).customer_name ?? "",
            page: "estimates",
        }));

    return [...customers, ...cars, ...estimates];
}
