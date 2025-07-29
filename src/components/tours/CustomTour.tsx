import type { TourStepProps } from 'antd';
import { FloatButton, Tour } from 'antd';
import { useTour } from '../../modules/hooks';

interface Steps extends Omit<TourStepProps, "target"> {
    target: string
}
interface Props {
    name: string,
    steps: Steps[]
    showHelp?: boolean
}


export default function CustomTour({ name, steps, showHelp = true }: Props) {
    const [open, setOpen] = useTour(name);

    return (
        <>
            <Tour open={open} onClose={() => setOpen(false)} steps={steps?.map(step => ({ ...step, target: document.getElementById(step.target) }))} />
            {showHelp && <FloatButton
                description="Aiuto"
                shape="circle"
                onClick={() => setOpen(true)}
            />}
        </>
    );
};

