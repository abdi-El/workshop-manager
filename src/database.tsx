import Database from '@tauri-apps/plugin-sql';
import { load } from '@tauri-apps/plugin-store';


const db = await Database.load('sqlite:estimates.db');
const storeSettings = await load('settings.json');

export { db, storeSettings };
