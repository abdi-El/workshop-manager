import { db } from "./database";

export const customersQuery = `SELECT * FROM customers ORDER BY id DESC`
export const workshopsQuery = `SELECT * FROM workshops ORDER BY id DESC`
export const makersQuery = `SELECT * FROM makers ORDER BY id DESC`
export const modelsQuery = `SELECT * FROM models ORDER BY id DESC`

export async function getPlannerEvents() {
    return db.select(
        `SELECT 
                    a.id as id,
                    a.workshop_id,
                    a.date,
                    a.from_time,
                    a.to_time,
                    
                    -- Customer (conditional)
                    c.name as customer_name,
                    c.phone as customer_phone,
                    
                    -- Car (conditional)
                    CONCAT(maker.name, ' ', model.name, ' (', car.year, ')') as car_info,
                    car.number_plate,
                    
                    -- Estimate status
                    CASE 
                        WHEN a.estimate_id IS NOT NULL THEN 1
                        ELSE 0
                    END as estimate_status

                FROM appointments a
                LEFT JOIN estimates e ON a.estimate_id = e.id
                LEFT JOIN customers c ON COALESCE(e.customer_id, a.customer_id) = c.id
                LEFT JOIN cars car ON COALESCE(e.car_id, a.car_id) = car.id
                LEFT JOIN makers maker ON car.maker_id = maker.id
                LEFT JOIN models model ON car.model_id = model.id
                ORDER BY a.date DESC, a.from_time;`
    )
}
export async function getUpcomingInspections() {
    return await db.select(
        `
        SELECT 
            c.id as car_id,
            c.year,
            c.last_inspection_date,
            c.customer_id,
            cust.name as customer_name,
            cust.phone as customer_phone,
            ma.name as maker_name,
            md.name as model_name
        FROM cars c
        JOIN customers cust ON c.customer_id = cust.id
        JOIN makers ma ON c.maker_id = ma.id
        JOIN models md ON c.model_id = md.id
        WHERE c.last_inspection_date IS NOT NULL
        AND (
                -- Convert last inspection date to YYYY-MM-DD
                DATE(
                    SUBSTR(c.last_inspection_date, 7, 4) || '-' ||
                    SUBSTR(c.last_inspection_date, 4, 2) || '-' ||
                    SUBSTR(c.last_inspection_date, 1, 2),
                    CASE
                        -- First inspection: 4 years after registration
                        WHEN c.last_inspection_date = c.year THEN '+4 years'
                        -- Otherwise every 2 years
                        ELSE '+2 years'
                    END
                )
            ) <= DATE('now', '+30 days') ORDER BY c.last_inspection_date ASC;   
        `)
}

export const customerCarsQuery = `SELECT cars.*,
                model.name as model_name,
                maker.name as maker_name
        FROM cars
        LEFT JOIN models as model ON cars.model_id = model.id
        LEFT JOIN makers as maker ON cars.maker_id = maker.id
        WHERE cars.customer_id = $1
        ORDER BY cars.id DESC`

export async function getCarHistory(carId: number) {
    return db.select(
        `SELECT
            e.id,
            e.date,
            e.labor_hours,
            e.labor_hourly_cost,
            e.discount,
            e.car_kms,
            e.notes,
            ROUND(
                (e.labor_hours * e.labor_hourly_cost) +
                COALESCE(ei.items_total, 0) -
                COALESCE(e.discount, 0),
            2) as total,
            ei.items_descriptions
        FROM estimates e
        LEFT JOIN (
            SELECT
                estimate_id,
                SUM(quantity * unit_price) as items_total,
                GROUP_CONCAT(quantity || '× ' || description, ' · ') as items_descriptions
            FROM estimate_items
            GROUP BY estimate_id
        ) ei ON e.id = ei.estimate_id
        WHERE e.car_id = $1
        ORDER BY DATE(
            SUBSTR(e.date, 7, 4) || '-' ||
            SUBSTR(e.date, 4, 2) || '-' ||
            SUBSTR(e.date, 1, 2)
        ) DESC`,
        [carId]
    )
}


export async function searchDefaultEstimateItems(query: string) {
    return db.select(
        `SELECT * FROM default_estimate_items
        WHERE LOWER(description) LIKE '%' || LOWER($1) || '%'
        ORDER BY description ASC`,
        [query]
    )
}

const estimatesBaseQuery = `SELECT
                    estimates.id as estimate_id,
                    estimates.car_id,
                    estimates.customer_id,
                    estimates.workshop_id,
                    estimates.*,
                    car.id as car_id,
                    car.number_plate as car_number_plate,
                    customer.id as customer_id,
                    customer.name as customer_name,
                    workshop.id as workshop_id,
                    workshop.name as workshop_name,
                    appointment.id as appointment_id,
                    appointment.estimate_id,
                    maker.name as maker_name,
                    CONCAT(estimates.date,' ', car.number_plate,' ', customer.name) as estimate_info,
                    ROUND(
                        (estimates.labor_hours * estimates.labor_hourly_cost) +
                        COALESCE(ei.items_total, 0) -
                        COALESCE(estimates.discount, 0),
                    2) as total

                FROM estimates
                LEFT JOIN cars as car ON estimates.car_id = car.id
                LEFT JOIN customers as customer ON estimates.customer_id = customer.id
                LEFT JOIN workshops as workshop ON estimates.workshop_id = workshop.id
                LEFT JOIN appointments as appointment ON appointment.estimate_id = estimates.id
                LEFT JOIN makers as maker ON car.maker_id = maker.id
                LEFT JOIN (
                    SELECT estimate_id, SUM(quantity * unit_price) as items_total
                    FROM estimate_items
                    GROUP BY estimate_id
                ) ei ON estimates.id = ei.estimate_id`

export const estimatesQuery = `${estimatesBaseQuery} ORDER BY id DESC`


const carBaseQuery = `SELECT cars.id as car_id,
                cars.model_id,
                cars.maker_id,
                cars.*,
                model.id as model_id,
                model.name as model_name,
                maker.id as maker_id,
                maker.name as maker_name,
                CONCAT(maker.name, ' ', model.name,' ' , number_plate ,' (', year, ')') as car_info
                FROM cars
            LEFT JOIN models as model ON cars.model_id = model.id
            LEFT JOIN makers as maker ON cars.maker_id = maker.id`

export const carQuery = `${carBaseQuery} ORDER BY id DESC`

export async function getEstimatePdfData(estimateId: number) {
    const rows = await db.select(
        `${estimatesBaseQuery} WHERE estimates.id = $1`, [estimateId]
    ) as any[];
    if (!rows[0]) return null;
    const estimate = rows[0];
    estimate.has_iva = estimate.has_iva == "true";

    const [cars, customers, workshops] = await Promise.all([
        db.select(`${carBaseQuery} WHERE cars.id = $1`, [estimate.car_id]) as Promise<any[]>,
        db.select(`SELECT * FROM customers WHERE id = $1`, [estimate.customer_id]) as Promise<any[]>,
        db.select(`SELECT * FROM workshops WHERE id = $1`, [estimate.workshop_id]) as Promise<any[]>,
    ]);
    if (!cars[0] || !customers[0] || !workshops[0]) return null;
    return { estimate, car: cars[0], customer: customers[0], workshop: workshops[0] };
}

export const dashboardAverages = `SELECT
    COUNT(*) as total_estimates,
    AVG(e.labor_hours) as avg_labor_hours,
    AVG(e.labor_hourly_cost) as avg_hourly_cost,
    AVG(COALESCE(e.discount, 0)) as avg_discount,
    AVG(COALESCE(ei.items_total, 0)) as avg_parts_cost,
    AVG(
        (e.labor_hours * e.labor_hourly_cost) + 
        COALESCE(ei.items_total, 0) - 
        COALESCE(e.discount, 0)
    ) as avg_total_estimate_value
FROM estimates e
LEFT JOIN (
    SELECT 
        estimate_id,
        SUM(quantity * unit_price) as items_total
    FROM estimate_items
    GROUP BY estimate_id
) ei ON e.id = ei.estimate_id;
`
export const CarsByYear = `
SELECT
    year,
    COUNT(*) as car_count
FROM cars
WHERE year IS NOT NULL
GROUP BY year
ORDER BY year ASC;
`

export const CarBrandsByCount = `
SELECT
    m.name as brand_name,
    COUNT(c.id) as car_count
FROM cars c
JOIN makers m ON c.maker_id = m.id
GROUP BY m.id, m.name
ORDER BY car_count DESC;
`

export const monthlyRevenue = `
SELECT
    SUBSTR(e.date, 7, 4) || '-' || SUBSTR(e.date, 4, 2) as month,
    ROUND(SUM(
        (e.labor_hours * e.labor_hourly_cost) +
        COALESCE(ei.items_total, 0) -
        COALESCE(e.discount, 0)
    ), 2) as total_revenue
FROM estimates e
LEFT JOIN (
    SELECT estimate_id, SUM(quantity * unit_price) as items_total
    FROM estimate_items
    GROUP BY estimate_id
) ei ON e.id = ei.estimate_id
GROUP BY SUBSTR(e.date, 7, 4) || '-' || SUBSTR(e.date, 4, 2)
ORDER BY month ASC
`

export const topCustomersByRevenue = `
SELECT
    c.name as customer_name,
    ROUND(SUM(
        (e.labor_hours * e.labor_hourly_cost) +
        COALESCE(ei.items_total, 0) -
        COALESCE(e.discount, 0)
    ), 2) as total_revenue,
    COUNT(e.id) as estimate_count
FROM estimates e
JOIN customers c ON e.customer_id = c.id
LEFT JOIN (
    SELECT estimate_id, SUM(quantity * unit_price) as items_total
    FROM estimate_items
    GROUP BY estimate_id
) ei ON e.id = ei.estimate_id
GROUP BY e.customer_id, c.name
ORDER BY total_revenue DESC
LIMIT 10
`