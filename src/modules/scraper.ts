const MAKERS_URL = "https://it.wikipedia.org/w/api.php?action=query&cmlimit=500&cmtitle=Categoria%3AAutomobili_per_marca&list=categorymembers&format=json"
const MODELS_URL = "https://it.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle={TITLE}&cmlimit=500&format=json"
import { fetch } from '@tauri-apps/plugin-http';
import { Maker, MakerModel } from '../types/database';
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

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

export async function updateOrCreateMaker(name: string, id: number) {
    if (id) {
        update({ name }, id, () => { }, "makers", false)
        return id
    } else {
        const query = await create({ name }, () => { }, "makers", false)
        return query?.lastInsertId || 0
    }
}

export async function updateOrCreateModels(name: string, makerId: number, id: number) {
    if (id) {
        await update({ name, maker_id: makerId }, id, () => { }, "models", false)
    } else {
        await create({ name, maker_id: makerId }, () => { }, "models", false)
    }
}

export async function getModelsAndMakers(onProgress?: (progress: number) => void) {
    const fetchedMakers = await getMakers();
    const makersStep = 100 / fetchedMakers.length;
    let totalProgress = 0;

    let dbMakers = await db.select(`SELECT * FROM makers`) as Maker[]
    let formattedMakers = dbMakers.reduce((prev, current) => {
        return { ...prev, [current.name]: current.id }
    }, {}) as Record<string, number>

    let dbModels = await db.select(`SELECT * FROM models`) as MakerModel[]
    let formattedModels = dbModels.reduce((prev, current) => {
        return { ...prev, [`${current.name}-${current.maker_id}`]: current.id }
    }, {}) as Record<string, number>

    for (const maker of fetchedMakers) {
        const makerName = maker.title.replace("Categoria:Automobili ", "").toUpperCase()
        const makerId = await updateOrCreateMaker(makerName, formattedMakers[makerName])
        const fetchedModels = await getModels(maker.title);
        const modelsStep = makersStep / fetchedModels.length;

        for (const model of fetchedModels) {
            const modelName = formatModelName(model.title, makerName)
            const isValid = !modelName.includes(" DA COMPETIZIONE") && !modelName.includes("CONCEPT CAR") && !modelName.includes("MODELLI")
            if (isValid) {
                await updateOrCreateModels(modelName, makerId, formattedModels[`${modelName}-${makerId}`])
            }
            totalProgress += modelsStep;
            onProgress?.(Math.round(totalProgress * 1e2) / 1e2);
        }

        await sleep(500);
    }
    onProgress?.(100);
}

