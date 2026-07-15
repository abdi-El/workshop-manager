const MAKERS_URL = "https://it.wikipedia.org/w/api.php?action=query&cmlimit=500&cmtitle=Categoria%3AAutomobili_per_marca&list=categorymembers&format=json"
const MODELS_URL = "https://it.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle={TITLE}&cmlimit=500&format=json"
import { invoke } from '@tauri-apps/api/core';
import { Maker, MakerModel } from '../types/database';
import { getDb } from './db/instance';

interface dataType {
    query: {
        categorymembers: [{
            pageid: number,
            ns: number,
            title: string
        }]
    }
}

const FETCH_DELAY_MS = 350
const MAX_RETRIES = 5

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithProxy(url: string) {
    let lastError: unknown
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const body = await invoke<string>('fetch', { url })
            // il rate limit di Wikipedia risponde con testo/HTML: JSON.parse fallisce e si riprova
            return JSON.parse(body)
        } catch (error) {
            lastError = error
            await sleep(2000 * 2 ** attempt)
        }
    }
    throw lastError
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

function handleError(error: any) {
    console.log("Errore durante il fetch:", error);
}

export async function updateOrCreateMaker(name: string, id: number) {
    if (id) {
        await getDb().update({ name }, id, "makers").catch(handleError)
        return id
    } else {
        const query = await getDb().create({ name }, "makers").catch(handleError)
        return query?.lastInsertId || 0
    }
}

export async function updateOrCreateModels(name: string, makerId: number, id: number) {
    if (id) {
        await getDb().update({ name, maker_id: makerId }, id, "models").catch(handleError)
    } else {
        await getDb().create({ name, maker_id: makerId }, "models").catch(handleError)
    }
}

export async function getModelsAndMakers(onProgress?: (progress: number) => void) {
    const fetchedMakers = await getMakers();
    const makersStep = 100 / fetchedMakers.length;
    let totalProgress = 0;

    let dbMakers = await getDb().getAllMakers() as Maker[]
    let formattedMakers = dbMakers.reduce((prev, current) => {
        return { ...prev, [current.name]: current.id }
    }, {}) as Record<string, number>

    let dbModels = await getDb().getAllModels() as MakerModel[]
    let formattedModels = dbModels.reduce((prev, current) => {
        return { ...prev, [`${current.name}-${current.maker_id}`]: current.id }
    }, {}) as Record<string, number>

    for (const maker of fetchedMakers) {
        const makerName = maker.title.replace("Categoria:Automobili ", "").toUpperCase()
        const makerId = await updateOrCreateMaker(makerName, formattedMakers[makerName])
        await sleep(FETCH_DELAY_MS)
        const fetchedModels = await getModels(maker.title);
        if (!fetchedModels.length) {
            totalProgress += makersStep;
            onProgress?.(Math.round(totalProgress * 1e2) / 1e2);
            continue;
        }
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
    }
    const otherMaker = await updateOrCreateMaker("ALTRA MARCA", formattedMakers["ALTRA MARCA"])
    await updateOrCreateModels("ALTRO MODELLO", otherMaker, formattedModels[`${"ALTRO MODELLO"}-${otherMaker}`])

    onProgress?.(100);
}

