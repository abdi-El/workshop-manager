import { db } from "./database";

export type SearchResultType = "customer" | "car" | "estimate";

export interface SearchResult {
    type: SearchResultType;
    id: number;
    title: string;
    subtitle: string;
    page: "customers" | "cars" | "estimates";
}

const MAX_RESULTS_PER_GROUP = 8;

interface CustomerRow { id: number; name: string; phone: string | null; email: string | null }
interface CarRow { id: number; number_plate: string; maker_name: string | null; model_name: string | null; year: number | null }
interface EstimateRow { id: number; date: string; number_plate: string | null; customer_name: string | null }

export async function globalSearch(rawQuery: string): Promise<SearchResult[]> {
    const trimmed = rawQuery.trim().toLowerCase();
    if (!trimmed) return [];
    const query = `%${trimmed}%`;

    const [customers, cars, estimates] = await Promise.all([
        db.select(
            `SELECT id, name, phone, email FROM customers
            WHERE LOWER(name) LIKE $1
                OR LOWER(COALESCE(phone, '')) LIKE $1
                OR LOWER(COALESCE(email, '')) LIKE $1
                OR LOWER(COALESCE(address, '')) LIKE $1
            ORDER BY id DESC LIMIT ${MAX_RESULTS_PER_GROUP}`,
            [query]
        ) as Promise<CustomerRow[]>,
        db.select(
            `SELECT cars.id, cars.number_plate, cars.year,
                maker.name as maker_name, model.name as model_name
            FROM cars
            LEFT JOIN makers as maker ON cars.maker_id = maker.id
            LEFT JOIN models as model ON cars.model_id = model.id
            WHERE LOWER(cars.number_plate) LIKE $1
                OR LOWER(COALESCE(maker.name, '')) LIKE $1
                OR LOWER(COALESCE(model.name, '')) LIKE $1
            ORDER BY cars.id DESC LIMIT ${MAX_RESULTS_PER_GROUP}`,
            [query]
        ) as Promise<CarRow[]>,
        db.select(
            `SELECT e.id, e.date, car.number_plate, customer.name as customer_name
            FROM estimates e
            LEFT JOIN cars as car ON e.car_id = car.id
            LEFT JOIN customers as customer ON e.customer_id = customer.id
            WHERE LOWER(COALESCE(customer.name, '')) LIKE $1
                OR LOWER(COALESCE(car.number_plate, '')) LIKE $1
                OR e.date LIKE $1
            ORDER BY e.id DESC LIMIT ${MAX_RESULTS_PER_GROUP}`,
            [query]
        ) as Promise<EstimateRow[]>,
    ]);

    return [
        ...customers.map((c): SearchResult => ({
            type: "customer",
            id: c.id,
            title: c.name,
            subtitle: [c.phone, c.email].filter(Boolean).join(" · "),
            page: "customers",
        })),
        ...cars.map((c): SearchResult => ({
            type: "car",
            id: c.id,
            title: c.number_plate,
            subtitle: [c.maker_name, c.model_name, c.year].filter(Boolean).join(" "),
            page: "cars",
        })),
        ...estimates.map((e): SearchResult => ({
            type: "estimate",
            id: e.id,
            title: [e.date, e.number_plate].filter(Boolean).join(" · "),
            subtitle: e.customer_name ?? "",
            page: "estimates",
        })),
    ];
}
