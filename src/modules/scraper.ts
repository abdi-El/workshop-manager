const ALLORIGINS_URL = "https://api.allorigins.win/get?url="
const CARS_DATA_URL = "https://it.wikipedia.org/w/api.php?action=query&cmlimit=500&cmtitle=Categoria%3AAutomobili_per_marca&list=categorymembers&format=json"


async function fetchWithProxy(url: string) {
    const response = await fetch(ALLORIGINS_URL + encodeURIComponent(url))
    const data = await response.json()
    return await JSON.parse(data.contents)
}

export async function getMakers() {
    const makers = await fetchWithProxy(CARS_DATA_URL)
    return makers.query.categorymembers
}


