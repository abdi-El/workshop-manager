import Database from '@tauri-apps/plugin-sql';
import { load } from '@tauri-apps/plugin-store';
import { message } from 'antd';


const db = await Database.load('sqlite:estimates.db');
const storeSettings = await load('settings.json');

export async function create(values: Record<string, any>, onCreate: () => void, table: string) {
    db.execute(`
        INSERT INTO ${table} (${Object.keys(values).join(", ")})
        VALUES (${Object.keys(values).map((_, index) => `$${index + 1}`).join(", ")})
    `, Object.values(values)).then(() => {
        message.success("Officina creata con successo!");
        onCreate()
    }).catch((error) => {
        message.error("Errore nella crezione dell'officina : " + error);

    });

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
