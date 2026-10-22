import posthog from 'posthog-js';
import { useStore } from './state';

const timers = new Map<string, number>();

export function initAnalytics() {
    const key = import.meta.env.VITE_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
        api_host: 'https://eu.i.posthog.com',
        persistence: 'memory',
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
    });

    track('page_view', { page: useStore.getState().page });

    useStore.subscribe((state, prev) => {
        if (state.page !== prev.page) {
            track('page_view', { page: state.page });
        }
    });
}

export function track(event: string, properties?: Record<string, unknown>) {
    if (!navigator.onLine) return;
    posthog.capture(event, properties);
}

export function identifyWorkshop(workshopId: number, workshopName: string) {
    if (!navigator.onLine) return;
    posthog.identify(String(workshopId), { workshop_name: workshopName });
}

export function startTimer(key: string) {
    timers.set(key, Date.now());
}

export function endTimer(key: string): number | undefined {
    const start = timers.get(key);
    if (!start) return undefined;
    timers.delete(key);
    return Math.round((Date.now() - start) / 1000);
}
