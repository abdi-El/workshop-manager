import { Estimate, EstimateItem } from "../types/database";

export function calculateEstiamteItemPrice(item: EstimateItem) {
    return item.quantity * item.unit_price;
}
export function calculateEstimatePrice(estiamte: Estimate, items: EstimateItem[]) {
    const itemsPrice = items.reduce((total, item) => total + calculateEstiamteItemPrice(item), 0);
    const workForcePrice = estiamte.labor_hours * estiamte.labor_hourly_cost;
    return (itemsPrice + workForcePrice) - (estiamte.discount || 0);
}