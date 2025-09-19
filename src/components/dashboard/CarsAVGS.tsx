import { Row } from "antd";

import { useEffect, useState } from "react";
import { db } from '../../modules/database';
import { CarBrandsByCount } from '../../modules/queries';
import { Car } from "../../types/database";


export default function CarsAVGS() {
    const [loading, setLoading] = useState(false)
    const [carsAverages, setCarsAverages] = useState<Car>()
    useEffect(() => {
        if (db) {
            setLoading(true)
            db.select(CarBrandsByCount).then((res: any) => {
                console.log(res)
            }).finally(() => {
                setLoading(false)
            })
        }
    }, [db])
    return <Row gutter={[16, 16]}>

    </Row>
}


