import CarsAVGS from "../components/dashboard/CarsAVGS";
import EstimatesAVGS from "../components/dashboard/EstimatesAVGS";
import InspectionReminder from "../components/dashboard/InspectionReminder";

export default function Dashboard() {
    return <>
        <EstimatesAVGS />
        <CarsAVGS />
        <InspectionReminder style={{ marginTop: 20 }} />
    </>
}


