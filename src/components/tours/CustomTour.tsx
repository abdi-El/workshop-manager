import type { TourProps } from 'antd';
import { FloatButton, Tour } from 'antd';
import { useState } from 'react';

interface Props {
    name: string,
    steps: TourProps['steps']
}


export default function CustomTour({ name, steps }: Props) {
    const [open, setOpen] = useState<boolean>(true);

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

