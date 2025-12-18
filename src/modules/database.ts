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


export async function create(values: Record<string, any>, onCreate: () => void, table: string, showMessage: boolean = true) {
    return db.execute(`
        INSERT INTO ${table} (${Object.keys(values).join(", ")})
        VALUES (${Object.keys(values).map((_, index) => `$${index + 1}`).join(", ")})
    `, Object.values(values)).then((queryResult) => {
        showMessage && message.success("Creato con successo!");
        onCreate()
        return queryResult;
    }).catch((error) => {
        message.error("Errore nella crezione : " + error);
    });

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
    if (estimateId != undefined) {
        update(estimate, estimateId, 'estimates', false).then(onFinish)
    }
    else {
        let result = (await create(estimate, onFinish, 'estimates', false))
        estimateId = result?.lastInsertId;
    }
    db.execute(`DELETE FROM estimate_items WHERE estimate_id = ${estimateId}`).then(() => {
        items.forEach(async ({ total_price, ...item }) => {
            await create({ ...item, estimate_id: estimateId }, () => { }, 'estimate_items', false);
        });
        message.success(`Operazione completata con successo!`);
        onFinish();
    }).catch((error) => {
        message.error("Errore nella creazione del preventivo : " + error);
    });

}
export async function getEstimateItems(estimateId: number) {
    return await db.select(`SELECT *, quantity * unit_price AS total_price FROM estimate_items WHERE estimate_id = ${estimateId}`);
}