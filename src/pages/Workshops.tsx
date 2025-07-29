import { useEffect } from "react";
import WorkshopForm from "../components/forms/WorkshopForm";
import WorkshopTour from "../components/tours/WorkshopTour";
import { useDatabaseStore, useStore } from "../modules/state";


export default function Workshops() {
    const { workshops } = useDatabaseStore((state) => state)
    const { updateSettings, settings } = useStore((state) => state);

    useEffect(() => {
        if (workshops) {
            updateSettings({ selectedWorkshop: workshops?.[0] || undefined })
        }
    }, [workshops])

    return <>
        <WorkshopForm onSubmit={() => { }} workshop={settings?.selectedWorkshop} />
        <WorkshopTour />
    </>
};

