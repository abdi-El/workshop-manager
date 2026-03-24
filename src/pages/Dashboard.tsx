import CarsAVGS from "../components/dashboard/CarsAVGS";
import EstimatesAVGS from "../components/dashboard/EstimatesAVGS";
import InspectionReminder from "../components/dashboard/InspectionReminder";
import RevenueChart from "../components/dashboard/RevenueChart";
import TopCustomers from "../components/dashboard/TopCustomers";

export default function Dashboard() {
    return <>
        <EstimatesAVGS />
        <RevenueChart />
        <TopCustomers />
        <CarsAVGS />
        <InspectionReminder style={{ marginTop: 20 }} />
    </>
}


