const MAKERS_URL = "https://it.wikipedia.org/w/api.php?action=query&cmlimit=500&cmtitle=Categoria%3AAutomobili_per_marca&list=categorymembers&format=json"
const MODELS_URL = "https://it.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle={TITLE}&cmlimit=500&format=json"
import { fetch } from '@tauri-apps/plugin-http';

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
    const formatted = title.replace(" ", "_")
    const models = await fetchWithProxy(MODELS_URL.replace("{TITLE}", formatted)) as dataType
    return models.query.categorymembers
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getModelsAndMakers(onProgress?: (progress: number) => void) {
    const makers = await getMakers();
    const makersStep = 100 / makers.length;
    let totalProgress = 0;

    for (const maker of makers) {
        const models = await getModels(maker.title);
        const modelsStep = makersStep / models.length;

        for (const _ of models) {
            totalProgress += modelsStep;
            onProgress?.(totalProgress);
        }

        await sleep(500);
    }
}

