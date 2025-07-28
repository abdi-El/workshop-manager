import type { TourProps } from 'antd';
import CustomTour from './CustomTour';

export default function WorkshopTour() {

    const steps: TourProps['steps'] = [
        {
            title: 'Dati Officina',
            description: 'Prima di cominciare ad usare l\' app è necessario inserire i dati dell\'officina',
            target: () => document.getElementById("WorkshopForm") as any,
        },
        {
            title: 'Salve',
            description: 'Una volta termiato cliccare su quì',
            target: () => document.getElementById("WorkshopFormSubmit") as any,
        },
    ];

    return <CustomTour steps={steps} name='workshopPage' />
};

