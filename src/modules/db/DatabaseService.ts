import {
    Appointment, AppointmentEventData, Car, CarHistoryEntry,
    Customer, EstiamatesAverages, Estimate, EstimateDefaultItem,
    EstimateItem, Maker, MakerModel, Workshop
} from "../../types/database";
import { SearchResult } from "../search";

const MAX_SEARCH_RESULTS = 8;

export interface QueryResult {
    lastInsertId: number;
    rowsAffected: number;
}

export abstract class DatabaseService {
    protected abstract select<T = any>(query: string, params?: any[]): Promise<T[]>;
    protected abstract execute(query: string, params?: any[]): Promise<QueryResult>;
    protected abstract withTransaction<T>(fn: () => Promise<T>): Promise<T>;

    // --- Generic CRUD ---

    async create(values: Record<string, any>, table: string): Promise<QueryResult> {
        const keys = Object.keys(values);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
        return this.execute(
            `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`,
            Object.values(values)
        );
    }

    async update(values: Record<string, any>, id: number, table: string): Promise<void> {
        const setClause = Object.keys(values)
            .filter(k => k !== "id")
            .map((key, i) => `${key} = $${i + 1}`)
            .join(", ");
        await this.execute(
            `UPDATE ${table} SET ${setClause} WHERE id = ${id}`,
            Object.values(values)
        );
    }

    async deleteRow(id: number, table: string): Promise<void> {
        await this.execute(`DELETE FROM ${table} WHERE id = $1`, [id]);
    }

    // --- List queries ---

    async getCustomers(): Promise<Customer[]> {
        return this.select<Customer>("SELECT * FROM customers ORDER BY id DESC");
    }

    async getWorkshops(): Promise<Workshop[]> {
        return this.select<Workshop>("SELECT * FROM workshops ORDER BY id DESC");
    }

    async getMakers(): Promise<Maker[]> {
        return this.select<Maker>("SELECT * FROM makers ORDER BY id DESC");
    }

    async getModels(): Promise<MakerModel[]> {
        return this.select<MakerModel>("SELECT * FROM models ORDER BY id DESC");
    }

    private readonly carsBaseQuery = `SELECT cars.id as car_id,
        cars.model_id, cars.maker_id, cars.*,
        model.id as model_id, model.name as model_name,
        maker.id as maker_id, maker.name as maker_name,
        CONCAT(maker.name, ' ', model.name,' ' , number_plate ,' (', year, ')') as car_info
        FROM cars
        LEFT JOIN models as model ON cars.model_id = model.id
        LEFT JOIN makers as maker ON cars.maker_id = maker.id`;

    async getCars(): Promise<Car[]> {
        return this.select<Car>(`${this.carsBaseQuery} ORDER BY id DESC`);
    }

    private readonly estimatesBaseQuery = `SELECT
        estimates.id as estimate_id, estimates.car_id, estimates.customer_id,
        estimates.workshop_id, estimates.*,
        car.id as car_id, car.number_plate as car_number_plate,
        customer.id as customer_id, customer.name as customer_name,
        workshop.id as workshop_id, workshop.name as workshop_name,
        appointment.id as appointment_id, appointment.estimate_id,
        maker.name as maker_name,
        CONCAT(estimates.date,' ', car.number_plate,' ', customer.name) as estimate_info,
        ROUND(
            (estimates.labor_hours * estimates.labor_hourly_cost) +
            COALESCE(ei.items_total, 0) - COALESCE(estimates.discount, 0),
        2) as total
        FROM estimates
        LEFT JOIN cars as car ON estimates.car_id = car.id
        LEFT JOIN customers as customer ON estimates.customer_id = customer.id
        LEFT JOIN workshops as workshop ON estimates.workshop_id = workshop.id
        LEFT JOIN appointments as appointment ON appointment.estimate_id = estimates.id
        LEFT JOIN makers as maker ON car.maker_id = maker.id
        LEFT JOIN (
            SELECT estimate_id, SUM(quantity * unit_price) as items_total
            FROM estimate_items GROUP BY estimate_id
        ) ei ON estimates.id = ei.estimate_id`;

    async getEstimates(): Promise<Estimate[]> {
        return this.select<Estimate>(`${this.estimatesBaseQuery} ORDER BY id DESC`);
    }

    async getCustomerCars(customerId: number): Promise<Car[]> {
        return this.select<Car>(
            `SELECT cars.*, model.name as model_name, maker.name as maker_name
            FROM cars
            LEFT JOIN models as model ON cars.model_id = model.id
            LEFT JOIN makers as maker ON cars.maker_id = maker.id
            WHERE cars.customer_id = $1
            ORDER BY cars.id DESC`,
            [customerId]
        );
    }

    async getMakersCount(): Promise<{ count: number }[]> {
        return this.select<{ count: number }>("SELECT COUNT(*) as count FROM makers");
    }

    // --- Named queries ---

    async getPlannerEvents(): Promise<AppointmentEventData[]> {
        return this.select<AppointmentEventData>(
            `SELECT
                a.id as id, a.workshop_id, a.date, a.from_time, a.to_time,
                c.name as customer_name, c.phone as customer_phone,
                CONCAT(maker.name, ' ', model.name, ' (', car.year, ')') as car_info,
                car.number_plate,
                CASE WHEN a.estimate_id IS NOT NULL THEN 1 ELSE 0 END as estimate_status
            FROM appointments a
            LEFT JOIN estimates e ON a.estimate_id = e.id
            LEFT JOIN customers c ON COALESCE(e.customer_id, a.customer_id) = c.id
            LEFT JOIN cars car ON COALESCE(e.car_id, a.car_id) = car.id
            LEFT JOIN makers maker ON car.maker_id = maker.id
            LEFT JOIN models model ON car.model_id = model.id
            ORDER BY a.date DESC, a.from_time`
        );
    }

    async getUpcomingInspections(): Promise<any[]> {
        return this.select(
            `SELECT
                c.id as car_id, c.year, c.last_inspection_date,
                c.customer_id, cust.name as customer_name, cust.phone as customer_phone,
                ma.name as maker_name, md.name as model_name
            FROM cars c
            JOIN customers cust ON c.customer_id = cust.id
            JOIN makers ma ON c.maker_id = ma.id
            JOIN models md ON c.model_id = md.id
            WHERE c.last_inspection_date IS NOT NULL
            AND (
                DATE(
                    SUBSTR(c.last_inspection_date, 7, 4) || '-' ||
                    SUBSTR(c.last_inspection_date, 4, 2) || '-' ||
                    SUBSTR(c.last_inspection_date, 1, 2),
                    CASE
                        WHEN c.last_inspection_date = c.year THEN '+4 years'
                        ELSE '+2 years'
                    END
                )
            ) <= DATE('now', '+30 days') ORDER BY c.last_inspection_date ASC`
        );
    }

    async getCarHistory(carId: number): Promise<CarHistoryEntry[]> {
        return this.select<CarHistoryEntry>(
            `SELECT
                e.id, e.date, e.labor_hours, e.labor_hourly_cost,
                e.discount, e.car_kms, e.notes,
                ROUND(
                    (e.labor_hours * e.labor_hourly_cost) +
                    COALESCE(ei.items_total, 0) - COALESCE(e.discount, 0),
                2) as total,
                ei.items_descriptions
            FROM estimates e
            LEFT JOIN (
                SELECT estimate_id,
                    SUM(quantity * unit_price) as items_total,
                    GROUP_CONCAT(quantity || '× ' || description, ' · ') as items_descriptions
                FROM estimate_items GROUP BY estimate_id
            ) ei ON e.id = ei.estimate_id
            WHERE e.car_id = $1
            ORDER BY DATE(
                SUBSTR(e.date, 7, 4) || '-' ||
                SUBSTR(e.date, 4, 2) || '-' ||
                SUBSTR(e.date, 1, 2)
            ) DESC`,
            [carId]
        );
    }

    async searchDefaultEstimateItems(query: string): Promise<EstimateDefaultItem[]> {
        return this.select<EstimateDefaultItem>(
            `SELECT * FROM default_estimate_items
            WHERE LOWER(description) LIKE '%' || LOWER($1) || '%'
            ORDER BY description ASC`,
            [query]
        );
    }

    async getEstimatePdfData(estimateId: number) {
        const rows = await this.select<any>(
            `${this.estimatesBaseQuery} WHERE estimates.id = $1`, [estimateId]
        );
        if (!rows[0]) return null;
        const estimate = rows[0];
        estimate.has_iva = estimate.has_iva == "true";

        const [cars, customers, workshops] = await Promise.all([
            this.select<Car>(`${this.carsBaseQuery} WHERE cars.id = $1`, [estimate.car_id]),
            this.select<Customer>(`SELECT * FROM customers WHERE id = $1`, [estimate.customer_id]),
            this.select<Workshop>(`SELECT * FROM workshops WHERE id = $1`, [estimate.workshop_id]),
        ]);
        if (!cars[0] || !customers[0] || !workshops[0]) return null;
        return { estimate, car: cars[0], customer: customers[0], workshop: workshops[0] };
    }

    async getEstimateItems(estimateId: number): Promise<EstimateItem[]> {
        return this.select<EstimateItem>(
            `SELECT *, quantity * unit_price AS total_price FROM estimate_items WHERE estimate_id = $1`,
            [estimateId]
        );
    }

    async getAppointment(appointmentId: number): Promise<Appointment | null> {
        const rows = await this.select<Appointment>(
            `SELECT * FROM appointments WHERE id = $1`, [appointmentId]
        );
        return rows[0] ?? null;
    }

    // --- Dashboard ---

    async getDashboardAverages(): Promise<EstiamatesAverages[]> {
        return this.select<EstiamatesAverages>(
            `SELECT
                COUNT(*) as total_estimates,
                AVG(e.labor_hours) as avg_labor_hours,
                AVG(e.labor_hourly_cost) as avg_hourly_cost,
                AVG(COALESCE(e.discount, 0)) as avg_discount,
                AVG(COALESCE(ei.items_total, 0)) as avg_parts_cost,
                AVG(
                    (e.labor_hours * e.labor_hourly_cost) +
                    COALESCE(ei.items_total, 0) - COALESCE(e.discount, 0)
                ) as avg_total_estimate_value
            FROM estimates e
            LEFT JOIN (
                SELECT estimate_id, SUM(quantity * unit_price) as items_total
                FROM estimate_items GROUP BY estimate_id
            ) ei ON e.id = ei.estimate_id`
        );
    }

    async getCarBrandsByCount(): Promise<{ brand_name: string; car_count: number }[]> {
        return this.select(
            `SELECT m.name as brand_name, COUNT(c.id) as car_count
            FROM cars c JOIN makers m ON c.maker_id = m.id
            GROUP BY m.id, m.name ORDER BY car_count DESC`
        );
    }

    async getCarsByYear(): Promise<{ year: string; car_count: number }[]> {
        return this.select(
            `SELECT year, COUNT(*) as car_count
            FROM cars WHERE year IS NOT NULL
            GROUP BY year ORDER BY year ASC`
        );
    }

    async getMonthlyRevenue(): Promise<{ month: string; total_revenue: number }[]> {
        return this.select(
            `SELECT
                SUBSTR(e.date, 7, 4) || '-' || SUBSTR(e.date, 4, 2) as month,
                ROUND(SUM(
                    (e.labor_hours * e.labor_hourly_cost) +
                    COALESCE(ei.items_total, 0) - COALESCE(e.discount, 0)
                ), 2) as total_revenue
            FROM estimates e
            LEFT JOIN (
                SELECT estimate_id, SUM(quantity * unit_price) as items_total
                FROM estimate_items GROUP BY estimate_id
            ) ei ON e.id = ei.estimate_id
            GROUP BY SUBSTR(e.date, 7, 4) || '-' || SUBSTR(e.date, 4, 2)
            ORDER BY month ASC`
        );
    }

    async getTopCustomersByRevenue(): Promise<{ customer_name: string; total_revenue: number; estimate_count: number }[]> {
        return this.select(
            `SELECT
                c.name as customer_name,
                ROUND(SUM(
                    (e.labor_hours * e.labor_hourly_cost) +
                    COALESCE(ei.items_total, 0) - COALESCE(e.discount, 0)
                ), 2) as total_revenue,
                COUNT(e.id) as estimate_count
            FROM estimates e
            JOIN customers c ON e.customer_id = c.id
            LEFT JOIN (
                SELECT estimate_id, SUM(quantity * unit_price) as items_total
                FROM estimate_items GROUP BY estimate_id
            ) ei ON e.id = ei.estimate_id
            GROUP BY e.customer_id, c.name
            ORDER BY total_revenue DESC LIMIT 10`
        );
    }

    // --- Search ---

    async globalSearch(rawQuery: string): Promise<SearchResult[]> {
        const trimmed = rawQuery.trim().toLowerCase();
        if (!trimmed) return [];
        const query = `%${trimmed}%`;

        const [customers, cars, estimates] = await Promise.all([
            this.select<{ id: number; name: string; phone: string | null; email: string | null }>(
                `SELECT id, name, phone, email FROM customers
                WHERE LOWER(name) LIKE $1
                    OR LOWER(COALESCE(phone, '')) LIKE $1
                    OR LOWER(COALESCE(email, '')) LIKE $1
                    OR LOWER(COALESCE(address, '')) LIKE $1
                ORDER BY id DESC LIMIT ${MAX_SEARCH_RESULTS}`,
                [query]
            ),
            this.select<{ id: number; number_plate: string; maker_name: string | null; model_name: string | null; year: number | null }>(
                `SELECT cars.id, cars.number_plate, cars.year,
                    maker.name as maker_name, model.name as model_name
                FROM cars
                LEFT JOIN makers as maker ON cars.maker_id = maker.id
                LEFT JOIN models as model ON cars.model_id = model.id
                WHERE LOWER(cars.number_plate) LIKE $1
                    OR LOWER(COALESCE(maker.name, '')) LIKE $1
                    OR LOWER(COALESCE(model.name, '')) LIKE $1
                ORDER BY cars.id DESC LIMIT ${MAX_SEARCH_RESULTS}`,
                [query]
            ),
            this.select<{ id: number; date: string; number_plate: string | null; customer_name: string | null }>(
                `SELECT e.id, e.date, car.number_plate, customer.name as customer_name
                FROM estimates e
                LEFT JOIN cars as car ON e.car_id = car.id
                LEFT JOIN customers as customer ON e.customer_id = customer.id
                WHERE LOWER(COALESCE(customer.name, '')) LIKE $1
                    OR LOWER(COALESCE(car.number_plate, '')) LIKE $1
                    OR e.date LIKE $1
                ORDER BY e.id DESC LIMIT ${MAX_SEARCH_RESULTS}`,
                [query]
            ),
        ]);

        return [
            ...customers.map((c): SearchResult => ({
                type: "customer", id: c.id, title: c.name,
                subtitle: [c.phone, c.email].filter(Boolean).join(" · "),
                page: "customers",
            })),
            ...cars.map((c): SearchResult => ({
                type: "car", id: c.id, title: c.number_plate,
                subtitle: [c.maker_name, c.model_name, c.year].filter(Boolean).join(" "),
                page: "cars",
            })),
            ...estimates.map((e): SearchResult => ({
                type: "estimate", id: e.id,
                title: [e.date, e.number_plate].filter(Boolean).join(" · "),
                subtitle: e.customer_name ?? "",
                page: "estimates",
            })),
        ];
    }

    // --- Transactional ---

    async createOrUpdateEstimate(estimate: Estimate, items: EstimateItem[], estimateId?: number): Promise<void> {
        await this.withTransaction(async () => {
            if (estimateId != undefined) {
                await this.update(estimate as any, estimateId, "estimates");
            } else {
                const result = await this.create(estimate as any, "estimates");
                estimateId = result.lastInsertId;
            }

            await this.execute(`DELETE FROM estimate_items WHERE estimate_id = $1`, [estimateId]);
            for (const { total_price, ...item } of items) {
                await this.create({ ...item, estimate_id: estimateId }, "estimate_items");
            }
        });
    }

    // --- Scraper helpers ---

    async getAllMakers(): Promise<Maker[]> {
        return this.select<Maker>("SELECT * FROM makers");
    }

    async getAllModels(): Promise<MakerModel[]> {
        return this.select<MakerModel>("SELECT * FROM models");
    }
}
