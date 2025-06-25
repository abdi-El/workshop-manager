// When using the Tauri API npm package:
import { invoke } from '@tauri-apps/api/core';

export async function fetchBrandsAndModels() {
    const brands = await invoke("fetch", { url: "https://hades.subito.it/v1/values/cars/brands" });
    console.log(brands);

    // const brands = await fetch("https://hades.subito.it/v1/values/cars/brands", {
    //     headers: {
    //         "User-Agent":
    //             "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...", // optional, backend might ignore it
    //     },
    // }).then((r) => r.json());
    // let brandsToSave = [];
    // const brand = brands.top_values[0].key
    // const models = await fetch(
    //     `https://hades.subito.it/v1/values/cars/brands/${brand}/metamodels?category=2`
    // ).then((r) => r.json());
    // const modelsToSave = models.top_values.map((model) => ({
    //     brand: brand.key,
    //     model: model.key,
    // }));
    // brandsToSave.push(modelsToSave);
    // alert(`Modelli per ${brand.key} salvati con successo!`);
    // Save brandsToSave
}