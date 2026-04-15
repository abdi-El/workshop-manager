// Sync diretto a Firestore: legge SQLite via exportAllData(), risolve
// makers/models sul catalogo globale e scrive in batch sotto users/{uid}/workshops/...
// Mirror di workshop-manager-web/src/lib/firestore.ts + import pipeline.

import {
    collection,
    doc,
    getDocs,
    writeBatch,
    type DocumentReference,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { exportAllData, type ExportV1 } from './export';

// ───────── Firestore paths (mirror dello schema web) ─────────

const userDoc = (uid: string) => doc(firestore, 'users', uid);
const workshopsCol = (uid: string) => collection(userDoc(uid), 'workshops');
const workshopDoc = (uid: string, wid: string) => doc(workshopsCol(uid), wid);
const customersCol = (uid: string, wid: string) => collection(workshopDoc(uid, wid), 'customers');
const carsCol = (uid: string, wid: string) => collection(workshopDoc(uid, wid), 'cars');
const estimatesCol = (uid: string, wid: string) => collection(workshopDoc(uid, wid), 'estimates');
const defaultItemsCol = (uid: string, wid: string) =>
    collection(workshopDoc(uid, wid), 'defaultItems');
const makersCol = () => collection(firestore, 'makers');
const makerModelsCol = () => collection(firestore, 'makerModels');

// ───────── Progress & result types ─────────

export type SyncPhase =
    | 'workshops'
    | 'customers'
    | 'cars'
    | 'estimates'
    | 'default_items'
    | 'done';

export type SyncProgress = {
    phase: SyncPhase;
    written: number;
    total: number;
};

export type SyncResult = {
    counts: {
        workshops: number;
        customers: number;
        cars: number;
        estimates: number;
        default_items: number;
    };
    warnings: string[];
};

// ───────── Batched writer (limite Firestore 500 ops/batch) ─────────

class BatchedWriter {
    private batch = writeBatch(firestore);
    private ops = 0;
    private total = 0;
    private readonly limit = 400;

    async set(ref: DocumentReference, data: Record<string, unknown>) {
        this.batch.set(ref, data);
        this.ops += 1;
        this.total += 1;
        if (this.ops >= this.limit) await this.flush();
    }

    async flush() {
        if (this.ops === 0) return;
        await this.batch.commit();
        this.batch = writeBatch(firestore);
        this.ops = 0;
    }

    get written() {
        return this.total;
    }
}

// UUID fallback — alcuni ambienti Tauri potrebbero non esporre crypto.randomUUID.
function uuid(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ───────── Runner ─────────

export async function syncAllToFirestore(
    uid: string,
    onProgress?: (p: SyncProgress) => void,
): Promise<SyncResult> {
    const data: ExportV1 = await exportAllData();
    const warnings: string[] = [];

    // Catalogo globale
    const [makersSnap, modelsSnap] = await Promise.all([
        getDocs(makersCol()),
        getDocs(makerModelsCol()),
    ]);
    const makers = makersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as {
        id: string;
        name: string;
    }[];
    const models = modelsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as {
        id: string;
        name: string;
        maker_id: string;
    }[];
    const makerByName = new Map(makers.map((m) => [m.name.toLowerCase(), m]));
    const modelByKey = new Map(
        models.map((m) => [`${m.maker_id}::${m.name.toLowerCase()}`, m]),
    );

    const workshopIdMap = new Map<number, string>();
    const customerIdMap = new Map<number, string>();
    const carIdMap = new Map<number, string>();

    const writer = new BatchedWriter();

    // 1) Workshops
    onProgress?.({ phase: 'workshops', written: 0, total: data.workshops.length });
    for (const [i, w] of data.workshops.entries()) {
        const ref = doc(workshopsCol(uid));
        workshopIdMap.set(w.local_id, ref.id);
        await writer.set(ref, {
            name: w.name,
            address: w.address,
            vat_number: w.vat_number,
            phone: w.phone,
            email: w.email,
            base_labor_cost: w.base_labor_cost,
        });
        onProgress?.({ phase: 'workshops', written: i + 1, total: data.workshops.length });
    }
    await writer.flush();

    // 2) Customers
    onProgress?.({ phase: 'customers', written: 0, total: data.customers.length });
    for (const [i, c] of data.customers.entries()) {
        const wid = workshopIdMap.get(c.workshop_local_id);
        if (!wid) {
            warnings.push(`Cliente "${c.name}" saltato: officina ${c.workshop_local_id} non trovata.`);
            continue;
        }
        const ref = doc(customersCol(uid, wid));
        customerIdMap.set(c.local_id, ref.id);
        await writer.set(ref, {
            workshop_id: wid,
            name: c.name,
            address: c.address ?? null,
            phone: c.phone,
            email: c.email ?? null,
            notes: c.notes ?? null,
        });
        onProgress?.({ phase: 'customers', written: i + 1, total: data.customers.length });
    }
    await writer.flush();

    // 3) Cars — risolve maker/model per nome sul catalogo globale.
    onProgress?.({ phase: 'cars', written: 0, total: data.cars.length });
    for (const [i, car] of data.cars.entries()) {
        const wid = workshopIdMap.get(car.workshop_local_id);
        const cid = customerIdMap.get(car.customer_local_id);
        if (!wid || !cid) {
            warnings.push(`Auto ${car.number_plate} saltata: officina o cliente non trovato.`);
            continue;
        }
        let maker_id = '';
        let model_id = '';
        if (car.maker_name) {
            const m = makerByName.get(car.maker_name.toLowerCase());
            if (m) {
                maker_id = m.id;
                if (car.model_name) {
                    const md = modelByKey.get(`${m.id}::${car.model_name.toLowerCase()}`);
                    if (md) model_id = md.id;
                }
            }
        }
        const ref = doc(carsCol(uid, wid));
        carIdMap.set(car.local_id, ref.id);
        await writer.set(ref, {
            workshop_id: wid,
            customer_id: cid,
            maker_id,
            model_id,
            year: car.year,
            number_plate: car.number_plate.toUpperCase(),
            last_inspection_date: car.last_inspection_date ?? null,
            maker_name: car.maker_name ?? '',
            model_name: car.model_name ?? '',
            notes: car.notes ?? null,
        });
        onProgress?.({ phase: 'cars', written: i + 1, total: data.cars.length });
    }
    await writer.flush();

    // 4) Estimates (items embedded)
    onProgress?.({ phase: 'estimates', written: 0, total: data.estimates.length });
    for (const [i, e] of data.estimates.entries()) {
        const wid = workshopIdMap.get(e.workshop_local_id);
        const cid = customerIdMap.get(e.customer_local_id);
        if (!wid || !cid) {
            warnings.push(`Preventivo ${e.local_id} saltato: officina o cliente non trovato.`);
            continue;
        }
        const carId = e.car_local_id == null ? '' : carIdMap.get(e.car_local_id) ?? '';
        const items = e.items.map((it) => ({
            id: uuid(),
            description: it.description,
            quantity: it.quantity,
            unit_price: it.unit_price,
        }));
        const ref = doc(estimatesCol(uid, wid));
        await writer.set(ref, {
            workshop_id: wid,
            customer_id: cid,
            car_id: carId,
            date: e.date,
            labor_hours: e.labor_hours,
            labor_hourly_cost: e.labor_hourly_cost,
            discount: e.discount,
            car_kms: e.car_kms,
            has_iva: e.has_iva,
            notes: e.notes ?? null,
            items,
        });
        onProgress?.({ phase: 'estimates', written: i + 1, total: data.estimates.length });
    }
    await writer.flush();

    // 5) Default items — se c'è una sola officina, attaccali lì; altrimenti skip.
    onProgress?.({ phase: 'default_items', written: 0, total: data.default_items.length });
    if (data.default_items.length > 0) {
        const widList = Array.from(workshopIdMap.values());
        if (widList.length === 1) {
            const targetWid = widList[0];
            for (const [i, d] of data.default_items.entries()) {
                const ref = doc(defaultItemsCol(uid, targetWid));
                await writer.set(ref, {
                    description: d.description,
                    unit_price: d.unit_price,
                });
                onProgress?.({
                    phase: 'default_items',
                    written: i + 1,
                    total: data.default_items.length,
                });
            }
        } else {
            warnings.push(
                `${data.default_items.length} voci predefinite non sincronizzate: più di un'officina nel DB locale, destinazione ambigua.`,
            );
        }
    }
    await writer.flush();

    onProgress?.({ phase: 'done', written: writer.written, total: writer.written });

    return {
        counts: {
            workshops: data.workshops.length,
            customers: data.customers.length,
            cars: data.cars.length,
            estimates: data.estimates.length,
            default_items: data.default_items.length,
        },
        warnings,
    };
}
