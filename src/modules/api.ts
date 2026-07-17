import {
    Appointment, AppointmentEventData, Car, CarHistoryEntry,
    Customer, EstiamatesAverages, Estimate, EstimateDefaultItem,
    EstimateItem, Maker, MakerModel, Workshop
} from "../types/database";
import { SearchResult } from "./search";

const API = "__TAURI_INTERNALS__" in window ? "http://localhost:3333/api" : "/api";

function wq(path: string, workshopId?: number) {
    if (!workshopId) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}workshop_id=${workshopId}`;
}

async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${API}${path}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    return text ? JSON.parse(text) : undefined as T;
}

async function put(path: string, body: unknown): Promise<void> {
    const res = await fetch(`${API}${path}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
}

async function del(path: string): Promise<void> {
    const res = await fetch(`${API}${path}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
}

export interface QueryResult {
    lastInsertId: number;
    rowsAffected: number;
}

export const api = {
    // Customers (scoped)
    getCustomers: (workshopId?: number) => get<Customer[]>(wq("/customers", workshopId)),
    createCustomer: (data: Record<string, unknown>) => post<QueryResult>("/customers", data),
    updateCustomer: (id: number, data: Record<string, unknown>) => put(`/customers/${id}`, data),
    deleteCustomer: (id: number) => del(`/customers/${id}`),

    // Workshops
    getWorkshops: () => get<Workshop[]>("/workshops"),
    getWorkshop: (id: number) => get<Workshop>(`/workshops/${id}`),
    createWorkshop: (data: Record<string, unknown>) => post<QueryResult>("/workshops", data),
    updateWorkshop: (id: number, data: Record<string, unknown>) => put(`/workshops/${id}`, data),
    deleteWorkshop: (id: number) => del(`/workshops/${id}`),

    // Cars (scoped)
    getCars: (workshopId?: number) => get<Car[]>(wq("/cars", workshopId)),
    createCar: (data: Record<string, unknown>) => post<QueryResult>("/cars", data),
    updateCar: (id: number, data: Record<string, unknown>) => put(`/cars/${id}`, data),
    deleteCar: (id: number) => del(`/cars/${id}`),
    getCustomerCars: (customerId: number) => get<Car[]>(`/customers/${customerId}/cars`),
    getCarHistory: (carId: number) => get<CarHistoryEntry[]>(`/cars/${carId}/history`),

    // Makers & Models
    getMakers: () => get<Maker[]>("/makers"),
    createMaker: (data: Record<string, unknown>) => post<QueryResult>("/makers", data),
    updateMaker: (id: number, data: Record<string, unknown>) => put(`/makers/${id}`, data),
    getMakersCount: () => get<{ count: number }[]>("/makers/count"),
    getModels: () => get<MakerModel[]>("/models"),
    createModel: (data: Record<string, unknown>) => post<QueryResult>("/models", data),
    updateModel: (id: number, data: Record<string, unknown>) => put(`/models/${id}`, data),

    // Estimates (scoped)
    getEstimates: (workshopId?: number) => get<Estimate[]>(wq("/estimates", workshopId)),
    deleteEstimate: (id: number) => del(`/estimates/${id}`),
    getEstimateItems: (estimateId: number) => get<EstimateItem[]>(`/estimates/${estimateId}/items`),
    getEstimatePdfData: (estimateId: number) => get<{ estimate: Estimate; car: Car; customer: Customer; workshop: Workshop } | null>(`/estimates/${estimateId}/pdf-data`),
    saveEstimate: (estimate: Record<string, unknown>, items: Record<string, unknown>[], estimateId?: number) =>
        estimateId
            ? put(`/estimates/${estimateId}`, { estimate, items })
            : post<QueryResult>("/estimates", { estimate, items }),

    // Appointments
    getAppointment: (id: number) => get<Appointment>(`/appointments/${id}`),
    createAppointment: (data: Record<string, unknown>) => post<QueryResult>("/appointments", data),
    updateAppointment: (id: number, data: Record<string, unknown>) => put(`/appointments/${id}`, data),
    deleteAppointment: (id: number) => del(`/appointments/${id}`),

    // Default Estimate Items
    searchDefaultEstimateItems: (q: string) => get<EstimateDefaultItem[]>(`/default-estimate-items/search?q=${encodeURIComponent(q)}`),
    createDefaultEstimateItem: (data: Record<string, unknown>) => post<QueryResult>("/default_estimate_items", data),
    updateDefaultEstimateItem: (id: number, data: Record<string, unknown>) => put(`/default_estimate_items/${id}`, data),
    deleteDefaultEstimateItem: (id: number) => del(`/default_estimate_items/${id}`),

    // Planner (scoped)
    getPlannerEvents: (workshopId?: number) => get<AppointmentEventData[]>(wq("/planner/events", workshopId)),

    // Inspections (scoped)
    getUpcomingInspections: (workshopId?: number) => get<unknown[]>(wq("/inspections/upcoming", workshopId)),

    // Dashboard (scoped)
    getDashboardAverages: (workshopId?: number) => get<EstiamatesAverages[]>(wq("/dashboard/averages", workshopId)),
    getCarBrandsByCount: (workshopId?: number) => get<{ brand_name: string; car_count: number }[]>(wq("/dashboard/brands", workshopId)),
    getCarsByYear: (workshopId?: number) => get<{ year: string; car_count: number }[]>(wq("/dashboard/cars-by-year", workshopId)),
    getMonthlyRevenue: (workshopId?: number) => get<{ month: string; total_revenue: number }[]>(wq("/dashboard/revenue", workshopId)),
    getTopCustomersByRevenue: (workshopId?: number) => get<{ customer_name: string; total_revenue: number; estimate_count: number }[]>(wq("/dashboard/top-customers", workshopId)),

    // Search (scoped)
    globalSearch: (q: string, workshopId?: number) => get<SearchResult[]>(wq(`/search?q=${encodeURIComponent(q)}`, workshopId)),

    // Settings (JSON file on server)
    getSettings: () => get<Record<string, unknown>>("/settings/settings"),
    saveSettings: (values: Record<string, unknown>) => put("/settings/settings", values),
    resetSettings: () => del("/settings/settings"),
};
