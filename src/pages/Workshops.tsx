import { useEffect } from "react";
import WorkshopForm from "../components/forms/WorkshopForm";
import WorkshopTour from "../components/tours/WorkshopTour";
import { useDbQuery } from "../modules/hooks";
import { workshopsQuery } from "../modules/queries";
import { useStore } from "../modules/state";
import { Workshop } from "../types/database";


export default function Workshops() {
    const { data: workshops, loading, reload } = useDbQuery<Workshop>(workshopsQuery)
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
