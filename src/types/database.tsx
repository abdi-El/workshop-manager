export type Workshop = {
    id: number;
    name: string;
    address: string;
    vat_number: string;
    phone: string;
    email: string;
    base_labor_cost: number;
};

export type Customer = {
    id: number;
    name: string;
    address?: string | null;
    phone: string;
    email?: string | null;
    workshop_id: number;
};

export type Maker = {
    id: number;
    name: string;
};

export type MakerModel = {
    id: number;
    name: string;
    maker_id: number;
};

export type Car = {
    id: number;
    customer_id: number;
    workshop_id: number;
    maker_id: number;
    model_id: number;
    year: number;
    number_plate: string;
};

export type Estimate = {
    id: number;
    workshop_id: number;
    customer_id: number;
    car_id: number;
    date: string; // ISO string
    labor_hours: number;
    labor_hourly_cost: number;
    discount?: number | null;
    car_kms: number;
    has_iva: boolean;
};

export type EstimateItem = {
    id: number;
    estimate_id: number;
    description: string;
    quantity: number;
    unit_price: number;
};
