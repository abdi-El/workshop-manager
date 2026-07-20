import { Col, Row } from "antd";
import CarsAVGS from "../components/dashboard/CarsAVGS";
import CarsByYearChart from "../components/dashboard/CarsByYearChart";
import EstimatesAVGS from "../components/dashboard/EstimatesAVGS";
import EstimatesPerMonthChart from "../components/dashboard/EstimatesPerMonthChart";
import InspectionReminder from "../components/dashboard/InspectionReminder";
import RevenueChart from "../components/dashboard/RevenueChart";
import TopCustomers from "../components/dashboard/TopCustomers";
import TopItems from "../components/dashboard/TopItems";
import { useStore } from "../modules/state";

export default function Dashboard() {
    const { settings } = useStore((state) => state)
    const workshopId = settings.selectedWorkshop?.id;

    return <>
        <EstimatesAVGS workshopId={workshopId} />
        <CarsAVGS workshopId={workshopId} />
        <Row gutter={[16, 0]}>
            <Col xs={24} lg={12}><EstimatesPerMonthChart workshopId={workshopId} /></Col>
            <Col xs={24} lg={12}><TopItems workshopId={workshopId} /></Col>
        </Row>
        {settings.showRevenueStatistics &&
            <Row gutter={[16, 0]}>
                <Col xs={24} lg={12}><RevenueChart workshopId={workshopId} /></Col>
                <Col xs={24} lg={12}><TopCustomers workshopId={workshopId} /></Col>
            </Row>
        }
        <CarsByYearChart workshopId={workshopId} />
        <InspectionReminder workshopId={workshopId} style={{ marginTop: 20 }} />
    </>
}


