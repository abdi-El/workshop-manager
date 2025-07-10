const MAKERS_URL = "https://it.wikipedia.org/w/api.php?action=query&cmlimit=500&cmtitle=Categoria%3AAutomobili_per_marca&list=categorymembers&format=json"
const MODELS_URL = "https://it.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle={TITLE}&cmlimit=500&format=json"
import { fetch } from '@tauri-apps/plugin-http';
import { Maker } from '../types/database';
import { create, db, update } from './database';

interface dataType {
    query: {
        categorymembers: [{
            pageid: number,
            ns: number,
            title: string
        }]
    }
}



async function fetchWithProxy(url: string) {
    const response = await fetch(url)
    const data = await response.json()
    return data
}

export async function getMakers() {
    const makers = await fetchWithProxy(MAKERS_URL) as dataType
    return makers.query.categorymembers
}

export async function getModels(title: string) {
    const formatted = title.replace(/ /g, "_")
    const models = await fetchWithProxy(MODELS_URL.replace("{TITLE}", formatted)) as dataType
    return models.query.categorymembers
}
export function formatModelName(name: string, makerName: string) {
    name = name.toUpperCase()
    name = name.replace(makerName, "")
    name = name.replace("CATEGORIA:", "")
    name = name.replace(/"/g, "")
    return name

}

export async function updateOrCreateMaker(name: string) {
    const result = await db.select(`SELECT * FROM makers WHERE name = "${name}"`) as Maker[]
    if (result.length) {
        const makerId = result[0].id
        update({ name }, makerId, () => { }, "makers", false)
        return makerId
    } else {
        const query = await create({ name }, () => { }, "makers", false)
        return query?.lastInsertId || 0
    }
}

export async function updateOrCreateModels(name: string, makerId: number) {
    const result = await db.select(`SELECT * FROM models WHERE name="${name}" AND maker_id=${makerId}`) as Maker[]
    if (result.length) {
        await update({ name, maker_id: makerId }, result[0].id, () => { }, "models", false)
    } else {
        await create({ name, maker_id: makerId }, () => { }, "models", false)
    }
}



export async function getModelsAndMakers(onProgress?: (progress: number) => void) {
    const makers = await getMakers();
    const makersStep = 100 / makers.length;
    let totalProgress = 0;

    for (const maker of makers) {
        const makerName = maker.title.replace("Categoria:Automobili ", "").toUpperCase()
        const makerId = await updateOrCreateMaker(makerName)
        const models = await getModels(maker.title);
        const modelsStep = makersStep / models.length;

        for (const model of models) {
            const modelName = formatModelName(model.title, makerName)
            const isValid = !modelName.includes(" DA COMPETIZIONE") || !modelName.includes("CONCEPT CAR")
            if (isValid) {
                await updateOrCreateModels(modelName, makerId)
            }
            totalProgress += modelsStep;
            onProgress?.(Math.round(totalProgress * 1e2) / 1e2);
        }
    }
    onProgress?.(100);
}

