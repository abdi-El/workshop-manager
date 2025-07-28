import type { TourProps } from 'antd';
import { FloatButton, Tour } from 'antd';
import { useTour } from '../../modules/hooks';

interface Props {
    name: string,
    steps: TourProps['steps']
}


export default function CustomTour({ name, steps }: Props) {
    const [open, setOpen] = useTour(name);

    return (
        <>
            <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
            <FloatButton
                description="Aiuto"
                shape="circle"
                onClick={() => setOpen(true)}
            />
        </>
    );
};

