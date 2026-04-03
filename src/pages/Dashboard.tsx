import CarsAVGS from "../components/dashboard/CarsAVGS";
import CarsByYearChart from "../components/dashboard/CarsByYearChart";
import EstimatesAVGS from "../components/dashboard/EstimatesAVGS";
import InspectionReminder from "../components/dashboard/InspectionReminder";
import RevenueChart from "../components/dashboard/RevenueChart";
import TopCustomers from "../components/dashboard/TopCustomers";
import { useStore } from "../modules/state";

export default function Dashboard() {
    const { settings } = useStore((state) => state)

    return <>
        <EstimatesAVGS />
        <CarsAVGS />
        {settings.showRevenueStatistics && <>
            <RevenueChart />
            <TopCustomers />
        </>}
        <CarsByYearChart />
        <InspectionReminder style={{ marginTop: 20 }} />
    </>
}


