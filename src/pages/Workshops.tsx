import { useEffect } from "react";
import WorkshopForm from "../components/forms/WorkshopForm";
import WorkshopTour from "../components/tours/WorkshopTour";
import { getDb } from "../modules/db/instance";
import { useQuery } from "../modules/hooks";
import { useStore } from "../modules/state";
import { Workshop } from "../types/database";


export default function Workshops() {
    const { data: workshops, loading, reload } = useQuery<Workshop>(() => getDb().getWorkshops())
    const { updateSettings, settings } = useStore((state) => state);

    useEffect(() => {
        if (!loading) {
            updateSettings({ selectedWorkshop: workshops?.[0] || undefined })
        }
    }, [workshops, loading])

    return <>
        <WorkshopForm onSubmit={() => { reload() }} workshop={settings?.selectedWorkshop} />
        <WorkshopTour />
    </>
};
