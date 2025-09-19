import { db } from "./database";

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

export const estimatesQuery = `SELECT 
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
                    CONCAT(estimates.date,' ', car.number_plate,' ', customer.name) as estimate_info

                FROM estimates
                LEFT JOIN cars as car ON estimates.car_id = car.id 
                LEFT JOIN customers as customer ON estimates.customer_id = customer.id 
                LEFT JOIN workshops as workshop ON estimates.workshop_id = workshop.id
                LEFT JOIN appointments as appointment ON appointment.estimate_id = estimates.id
                ORDER BY id DESC 
                `


export const carQuery = `SELECT cars.id as car_id,
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
            LEFT JOIN makers as maker ON cars.maker_id = maker.id
            ORDER BY id DESC
            `

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