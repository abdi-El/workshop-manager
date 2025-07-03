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