import '../../css/olu.css';
import '../../css/olu-features.css';
import '../../css/olu-layout.css';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import ProfileMenu from '../components/profile-menu';
import Sidebar from '../components/sidebar';
import type { SharedProps } from '../types/olu';

type Props = {
    title: string;
    children: ReactNode;
};

export default function AppLayout({ title, children }: Props) {
    const { auth, flash } = usePage<SharedProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const theme = auth.user?.theme ?? 'system';

    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'system') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', theme);
        }
    }, [theme]);

    return (
        <>
            <Head title={title} />
            <div className="olu olu-shell">
                <header className="olu-topbar">
                    <button
                        type="button"
                        className="olu-burger"
                        aria-label="Toggle menu"
                        onClick={() => setSidebarOpen((v) => !v)}
                    >
                        ☰
                    </button>
                    <Link href="/" className="olu-brand">
                        Our Little Universe
                    </Link>
                    <div className="olu-topbar-spacer" />
                    {auth.user && <ProfileMenu user={auth.user} />}
                </header>

                <div className="olu-body">
                    <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
                    <div
                        className={`olu-backdrop ${sidebarOpen ? 'show' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="olu-content">
                        <main className="olu-main">
                            {flash?.status && <div className="olu-flash">{flash.status}</div>}
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}