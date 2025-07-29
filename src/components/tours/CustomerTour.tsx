import CustomTour from './CustomTour';

export default function CustomersTour() {

    const steps = [
        {
            title: 'Crea Cliente',
            description: 'Clicca qui per creare un nuovo cliente',
            target: "CreateNewCustomer"
        },
    ];

    return <CustomTour steps={steps} name='customerPage' />
};

