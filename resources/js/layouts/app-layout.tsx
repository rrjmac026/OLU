import '../../css/olu.css';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { SharedProps } from '../types/olu';

type Props = {
    title: string;
    children: ReactNode;
};

export default function AppLayout({ title, children }: Props) {
    const { auth, flash } = usePage<SharedProps>().props;

    return (
        <>
            <Head title={title} />
            <div className="olu">
                <header className="olu-nav">
                    <Link href="/" className="olu-brand">
                        Our Little Universe
                    </Link>
                    <nav>
                        <Link href="/">Home</Link>
                        <Link href="/settings/profile">Settings</Link>
                        {auth.user?.role === 'admin' && <Link href="/admin/users">Admin</Link>}
                    </nav>
                    <button type="button" className="olu-link" onClick={() => router.post('/logout')}>
                        Log out
                    </button>
                </header>
                <main className="olu-main">
                    {flash?.status && <div className="olu-flash">{flash.status}</div>}
                    {children}
                </main>
            </div>
        </>
    );
}