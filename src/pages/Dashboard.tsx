import CarsAVGS from "../components/dashboard/CarsAVGS";
import EstimatesAVGS from "../components/dashboard/EstimatesAVGS";
import InspectionReminder from "../components/dashboard/InspectionReminder";
import RevenueChart from "../components/dashboard/RevenueChart";
import TopCustomers from "../components/dashboard/TopCustomers";
import { useStore } from "../modules/state";

export default function Dashboard() {
    const { settings } = useStore((state) => state)

    return <>
        <EstimatesAVGS />
        {settings.showRevenueStatistics && <>
            <RevenueChart />
            <TopCustomers />
        </>}
        <CarsAVGS />
        <InspectionReminder style={{ marginTop: 20 }} />
    </>
}


