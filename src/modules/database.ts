import Database from '@tauri-apps/plugin-sql';
import { load } from '@tauri-apps/plugin-store';
import { message } from 'antd';
import { Estimate, EstimateItem } from '../types/database';



let db: Awaited<ReturnType<typeof Database.load>>;
let storeSettings: Awaited<ReturnType<typeof load>>;

export async function initDatabase() {
    db = await Database.load('sqlite:estimates.db');
    storeSettings = await load('settings.json');
}


export async function create(values: Record<string, any>, table: string, showMessage: boolean = true) {
    return db.execute(`
        INSERT INTO ${table} (${Object.keys(values).join(", ")})
        VALUES (${Object.keys(values).map((_, index) => `$${index + 1}`).join(", ")})
    `, Object.values(values)).then((queryResult) => {
        showMessage && message.success("Creato con successo!");
        return queryResult;
    }).catch((error) => {
        showMessage && message.error("Errore nella creazione: " + error);
        throw error;
    })

}
export async function updateOrCreate(values: Record<string, any>, table: string) {
    return db.execute(`
        INSERT OR REPLACE INTO ${table}(${Object.keys(values)}) 
        VALUES(${Object.keys(values).map((_, index) => `$${index + 1}`).join(", ")})`, Object.values(values))

}
export async function update(values: Record<string, any>, id: number, table: string, showMessage: boolean = true) {
    return db.execute(`
        UPDATE ${table} SET ${Object.keys(values).filter(key => key !== 'id').map((key, index) => `${key} = $${index + 1}`).join(", ")}
        WHERE id = ${id}
    `, [...Object.values(values)]).then(() => {
        showMessage && message.success("Aggiornato con successo!");
    }).catch((error) => {
        showMessage && message.error("Errore nell'aggiornamento: " + error);
        throw error;
    })
}

export async function deleteRow(id: number, table: string, onDelete: () => void) {
    db.execute(`DELETE FROM ${table} WHERE id = $1`, [id]).then(() => {
        message.success("Eliminato con successo!");
        onDelete()
    }).catch((error) => {
        message.error("Errore nell'eliminazione : " + error);
    })
}
export { db, storeSettings };




export async function createOrUpdateEstimate(estimate: Estimate, items: EstimateItem[], onFinish: () => void, estimateId?: number) {
    try {
        if (estimateId != undefined) {
            await update(estimate, estimateId, 'estimates', false);
        } else {
            const result = await create(estimate, 'estimates', false);
            estimateId = result?.lastInsertId;
        }

        await db.execute(`DELETE FROM estimate_items WHERE estimate_id = ${estimateId}`);
        await Promise.all(items.map(({ total_price, ...item }) =>
            create({ ...item, estimate_id: estimateId }, 'estimate_items', false)
        ));

        message.success('Operazione completata con successo!');
        onFinish();
    } catch (error) {
        message.error("Errore nella creazione del lavoro: " + error);
    }
}
export async function getEstimateItems(estimateId: number) {
    return await db.select(`SELECT *, quantity * unit_price AS total_price FROM estimate_items WHERE estimate_id = ${estimateId}`);
}