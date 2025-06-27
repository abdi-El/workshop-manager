import Database from '@tauri-apps/plugin-sql';
import { load } from '@tauri-apps/plugin-store';
import { message } from 'antd';
import makersModels from './makers-models.json';


const db = await Database.load('sqlite:estimates.db');
const storeSettings = await load('settings.json');

export async function create(values: Record<string, any>, onCreate: () => void, table: string) {
    db.execute(`
        INSERT INTO ${table} (${Object.keys(values).join(", ")})
        VALUES (${Object.keys(values).map((_, index) => `$${index + 1}`).join(", ")})
    `, Object.values(values)).then((queryResult) => {
        message.success("Officina creata con successo!");
        onCreate()
        return queryResult;
    }).catch((error) => {
        message.error("Errore nella crezione dell'officina : " + error);
    });

}
export async function updateOrCreate(values: Record<string, any>, table: string) {
    return db.execute(`
        INSERT OR REPLACE INTO ${table}(${Object.keys(values)}) 
        VALUES(${Object.keys(values).map((_, index) => `$${index + 1}`).join(", ")})`, Object.values(values))

}
export async function update(values: Record<string, any>, id: number, onUpdate: () => void, table: string) {
    db.execute(`
        UPDATE ${table} SET ${Object.keys(values).filter(key => key !== 'id').map((key, index) => `${key} = $${index + 1}`).join(", ")}
        WHERE id = ${id}
    `, [...Object.values(values)]).then(() => {
        message.success("Officina aggiornata con successo!");
        onUpdate()
    }).catch((error) => {
        message.error("Errore nell'aggiornamento dell'officina : " + error);
    })
}

export async function deleteRow(id: number, table: string, onDelete: () => void) {
    db.execute(`DELETE FROM ${table} WHERE id = $1`, [id]).then(() => {
        message.success("Officina eliminata con successo!");
        onDelete()
    }).catch((error) => {
        message.error("Errore nell'eliminazione dell'officina : " + error);
    })
}
export { db, storeSettings };


export async function populateMakers() {
    if (!(await storeSettings.get('makersPopulated'))) {
        Object.values(makersModels).forEach(async (maker) => {
            const { models, ...makerToSave } = maker;
            const queryResult = await updateOrCreate(makerToSave, 'makers');
            for (let model of models) {
                await updateOrCreate({ name: model, "maker_id": queryResult.lastInsertId }, 'models');
            }
        });
        await storeSettings.set('makersPopulated', true);
        message.success("Marche e Modelli popolati con successo!");
    }
}