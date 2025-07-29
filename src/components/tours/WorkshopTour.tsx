import CustomTour from './CustomTour';

export default function WorkshopTour() {

    const steps = [
        {
            title: 'Dati Officina',
            description: 'Prima di cominciare ad usare l\' app è necessario inserire i dati dell\'officina',
            target: "WorkshopForm",
        },
        {
            title: 'Salve',
            description: 'Una volta termiato cliccare su quì',
            target: "WorkshopFormSubmit",
        },
    ];

    return <CustomTour steps={steps} name='workshopPage' />
};

