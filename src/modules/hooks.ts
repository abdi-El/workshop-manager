import { BaseDirectory, exists, readFile, remove, writeTextFile } from '@tauri-apps/plugin-fs';
import { message } from "antd";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { storeSettings } from "./database";
import { getModelsAndMakers } from "./scraper";

interface ScraperState {
    percentage: number,
    setPercentage: (percentage: number) => void
    loading: boolean,
    trigger: () => void
}
export const useScraper = create<ScraperState>()((set) => {
    return {
        percentage: 0,
        setPercentage: (percentage: number) => set({ percentage }),
        loading: false,
        trigger: () => set((curr) => {
            if (!curr.loading) {
                set({ percentage: 0 })
                set({ loading: true })
                getModelsAndMakers((percentage: number) => {
                    if (percentage == 100) {
                        message.success("Marche e Modelli importati con successo")
                        set({ loading: false })
                    }
                    set({ percentage })
                })
            }
            return {}
        }
        )
    }
})


async function updateTourState(name: string, value: boolean) {
    storeSettings.get("tours").then(values => {
        let newValues = {
            ...(values || {}), [name]: value
        }
        storeSettings.set("tours", newValues)
    })

}

export function useTour(name: string): [boolean, ((value: boolean) => Promise<void>)] {
    const [isOpen, setIsOpen] = useState(false)
    useEffect(() => {
        storeSettings.get("tours").then((values) => {
            const storeValue = (values as Record<string, boolean>)?.[name]
            if (storeValue == undefined) {
                setIsOpen(true)
                return
            }
            setIsOpen(storeValue)
        })
    }, [])
    async function setOpenState(value: boolean) {
        updateTourState(name, value)
        setIsOpen(value)
    }
    return [isOpen, setOpenState]
}


export function useFile(fileName: string) {
    const [fileExists, setFileExists] = useState<boolean>();
    const [contents, setContents] = useState<string>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        exists(fileName, { baseDir: BaseDirectory.AppData }).then(async (exists) => {
            setFileExists(exists);
            if (exists) {
                await readFile(fileName, {
                    baseDir: BaseDirectory.AppData,
                }).then((data) => {
                    const text = new TextDecoder().decode(data);
                    setContents(text);
                });
            }
        }).finally(() => {
            setLoading(false);
        })
    }, [fileName])

    function write(contents: string) {
        setLoading(true);
        writeTextFile(fileName, contents, { baseDir: BaseDirectory.AppData }).then(() => {
            setFileExists(true);
            setContents(contents);
        }).finally(() => {
            setLoading(false);
        })
    }
    function deleteFile() {
        setLoading(true);
        remove(fileName, { baseDir: BaseDirectory.AppData }).then(() => {
            setFileExists(false);
            setContents(undefined);
        }).finally(() => {
            setLoading(false);
        })
    }

    return { fileExists, contents, loading, write, deleteFile };
}