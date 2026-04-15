import { db } from './database';

// Export JSON v1 — interchange format verso workshop-manager-web.
// Appuntamenti esclusi per scelta utente.
// Date SQLite: DD-MM-YYYY → JSON v1: YYYY-MM-DD.
// Cars: maker_id/model_id FK locali risolti in maker_name/model_name (il web
// li ri-aggancia al catalogo globale cercando per nome).

export type ExportV1 = {
    version: 1;
    exported_at: string; // ISO datetime
    source: 'workshop-manager-desktop';
    workshops: ExportWorkshop[];
    customers: ExportCustomer[];
    cars: ExportCar[];
    estimates: ExportEstimate[];
    default_items: ExportDefaultItem[];
};

export type ExportWorkshop = {
    local_id: number;
    name: string;
    address: string;
    vat_number: string;
    phone: string;
    email: string;
    base_labor_cost: number;
};

export type ExportCustomer = {
    local_id: number;
    workshop_local_id: number;
    name: string;
    address: string | null;
    phone: string;
    email: string | null;
    notes: string | null;
};

export type ExportCar = {
    local_id: number;
    workshop_local_id: number;
    customer_local_id: number;
    maker_name: string | null;
    model_name: string | null;
    year: number;
    number_plate: string;
    last_inspection_date: string | null; // YYYY-MM-DD
    notes: string | null;
};

export type ExportEstimateItem = {
    description: string;
    quantity: number;
    unit_price: number;
};

export type ExportEstimate = {
    local_id: number;
    workshop_local_id: number;
    customer_local_id: number;
    car_local_id: number | null;
    date: string; // YYYY-MM-DD
    labor_hours: number;
    labor_hourly_cost: number;
    discount: number | null;
    car_kms: number;
    has_iva: boolean;
    notes: string | null;
    items: ExportEstimateItem[];
};

export type ExportDefaultItem = {
    description: string;
    unit_price: number;
};

// DD-MM-YYYY → YYYY-MM-DD. Null se malformato.
function normalizeDate(d: string | null | undefined): string | null {
    if (!d) return null;
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(d);
    if (!m) return null;
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
}

export async function exportAllData(): Promise<ExportV1> {
    const workshops = await db.select<any[]>('SELECT * FROM workshops');
    const customers = await db.select<any[]>('SELECT * FROM customers');
    const cars = await db.select<any[]>(
        `SELECT c.*, mk.name AS maker_name, md.name AS model_name
         FROM cars c
         LEFT JOIN makers mk ON mk.id = c.maker_id
         LEFT JOIN models md ON md.id = c.model_id`,
    );
    const estimates = await db.select<any[]>('SELECT * FROM estimates');
    const items = await db.select<any[]>('SELECT * FROM estimate_items');
    const defaults = await db.select<any[]>('SELECT * FROM default_estimate_items');

    const itemsByEstimate = new Map<number, ExportEstimateItem[]>();
    for (const it of items) {
        const arr = itemsByEstimate.get(it.estimate_id) ?? [];
        arr.push({
            description: it.description,
            quantity: Number(it.quantity),
            unit_price: Number(it.unit_price),
        });
        itemsByEstimate.set(it.estimate_id, arr);
    }

    return {
        version: 1,
        exported_at: new Date().toISOString(),
        source: 'workshop-manager-desktop',
        workshops: workshops.map((w) => ({
            local_id: w.id,
            name: w.name,
            address: w.address,
            vat_number: w.vat_number,
            phone: w.phone,
            email: w.email,
            base_labor_cost: Number(w.base_labor_cost),
        })),
        customers: customers.map((c) => ({
            local_id: c.id,
            workshop_local_id: c.workshop_id,
            name: c.name,
            address: c.address ?? null,
            phone: c.phone,
            email: c.email ?? null,
            notes: c.notes ?? null,
        })),
        cars: cars.map((c) => ({
            local_id: c.id,
            workshop_local_id: c.workshop_id,
            customer_local_id: c.customer_id,
            maker_name: c.maker_name ?? null,
            model_name: c.model_name ?? null,
            year: Number(c.year),
            number_plate: c.number_plate,
            last_inspection_date: normalizeDate(c.last_inspection_date),
            notes: c.notes ?? null,
        })),
        estimates: estimates.map((e) => ({
            local_id: e.id,
            workshop_local_id: e.workshop_id,
            customer_local_id: e.customer_id,
            car_local_id: e.car_id ?? null,
            date: normalizeDate(e.date) ?? '',
            labor_hours: Number(e.labor_hours),
            labor_hourly_cost: Number(e.labor_hourly_cost),
            discount: e.discount == null ? null : Number(e.discount),
            car_kms: Number(e.car_kms),
            has_iva: Boolean(e.has_iva),
            notes: e.notes ?? null,
            items: itemsByEstimate.get(e.id) ?? [],
        })),
        default_items: defaults.map((d) => ({
            description: d.description,
            unit_price: Number(d.unit_price),
        })),
    };
}
