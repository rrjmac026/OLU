import '../../css/olu.css';
import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

type Props = {
    title: string;
    children: ReactNode;
};

export default function GuestLayout({ title, children }: Props) {
    return (
        <>
            <Head title={title} />
            <div className="olu-guest">{children}</div>
        </>
    );
}