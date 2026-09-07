import { message, Space, Spin } from "antd";
import { lazy, Suspense, useEffect, useState } from "react";
import { api } from "../../modules/api";
import { useStore } from "../../modules/state";
import { Car, Customer, Estimate } from "../../types/database";
import DeleteButton from "../buttons/DeleteButton";
import EditButton from "../buttons/EditButton";
import CarDetail from "./CarDetail";
import CustomerDetail from "./CustomerDetail";
import DetailModal from "./DetailModal";
import EstimateDetail from "./EstimateDetail";

const SaveEstimatePdf = lazy(() => import("../pdf/SavePdfButton"));

type EntityData =
    | { table: "estimates"; data: Estimate }
    | { table: "cars"; data: Car }
    | { table: "customers"; data: Customer };

const pageName: Record<string, string> = {
    estimates: "estimates",
    cars: "cars",
    customers: "customers",
};

export default function GlobalDetailModal() {
    const { searchTarget, setSearchTarget, updatePage } = useStore();
    const [entity, setEntity] = useState<EntityData>();
    const [loading, setLoading] = useState(false);

    const isDetail = searchTarget && searchTarget.action !== "edit";

    useEffect(() => {
        if (!searchTarget || searchTarget.action === "edit") return;
        setLoading(true);
        const { table, id } = searchTarget;
        if (table === "estimates") {
            api.getEstimate(id).then((data) => {
                const est = { ...data, has_iva: (data.has_iva as any) == "true" } as Estimate;
                setEntity({ table: "estimates", data: est });
            }).catch(() => message.error("Errore nel caricamento")).finally(() => setLoading(false));
        } else if (table === "cars") {
            api.getCar(id).then((data) => setEntity({ table: "cars", data: data as Car }))
                .catch(() => message.error("Errore nel caricamento")).finally(() => setLoading(false));
        } else if (table === "customers") {
            api.getCustomer(id).then((data) => setEntity({ table: "customers", data: data as Customer }))
                .catch(() => message.error("Errore nel caricamento")).finally(() => setLoading(false));
        }
    }, [searchTarget]);

    function close() {
        setSearchTarget(undefined);
        setEntity(undefined);
    }

    function goEdit() {
        if (!entity) return;
        close();
        setSearchTarget({ table: entity.table, id: entity.data.id, action: "edit" });
        updatePage(pageName[entity.table]);
    }

    function handleDelete() {
        if (!entity) return;
        const { table, data } = entity;
        const deleteFn = table === "estimates" ? api.deleteEstimate
            : table === "cars" ? api.deleteCar
            : api.deleteCustomer;
        deleteFn(data.id).then(() => {
            message.success("Eliminato con successo!");
            close();
        }).catch((e) => message.error("Errore nell'eliminazione: " + e));
    }

    function getTitle() {
        if (!entity) return "";
        if (entity.table === "estimates") {
            const e = entity.data;
            return `Lavoro — ${e.customer_name ?? ""} ${e.car_number_plate ?? ""}`;
        }
        if (entity.table === "cars") {
            const c = entity.data;
            return `${c.maker_name ?? ""} ${c.model_name ?? ""} — ${c.number_plate}`;
        }
        return entity.data.name;
    }

    function getFooter() {
        if (!entity) return null;
        return <Space size={4}>
            <EditButton onClick={goEdit} />
            {entity.table === "estimates" && <Suspense><SaveEstimatePdf estimateId={entity.data.id} /></Suspense>}
            <DeleteButton onConfirm={handleDelete} />
        </Space>;
    }

    return <DetailModal
        open={!!isDetail && (!!entity || loading)}
        onClose={close}
        title={getTitle()}
        footer={getFooter()}
    >
        {loading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> : <>
            {entity?.table === "estimates" && <EstimateDetail estimate={entity.data} />}
            {entity?.table === "cars" && <CarDetail car={entity.data} />}
            {entity?.table === "customers" && <CustomerDetail customer={entity.data} />}
        </>}
    </DetailModal>;
}
