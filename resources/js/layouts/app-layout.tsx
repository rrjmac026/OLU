import '../../css/olu.css';
import '../../css/olu-features.css';
import '../../css/olu-layout.css';
import '../../css/olu-dashboard.css';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import ProfileMenu from '../components/profile-menu';
import QuickSearch from '../components/quick-search';
import Sidebar from '../components/sidebar';
import type { SharedProps } from '../types/olu';
import { Bell } from 'lucide-react';
import ChatBubble from '../components/chat-bubble';



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
        if (theme === 'system') root.removeAttribute('data-theme');
        else root.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <>
            <Head title={title} />
            <div className="olu olu-shell">
                <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
                <div className={`olu-backdrop ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

                <div className="olu-content">
                    <header className="olu-topbar">
                        <button type="button" className="olu-burger" aria-label="Toggle menu" onClick={() => setSidebarOpen((v) => !v)}>
                            ☰
                        </button>
                        <div className="olu-topbar-spacer" />
                        <button type="button" className="olu-bell" aria-label="Notifications">
                            <Bell size={20} />
                            <span className="olu-bell-dot" />
                        </button>
                        {auth.user && <ProfileMenu user={auth.user} />}
                    </header>
                    <main className="olu-main">
                        {flash?.status && <div className="olu-flash">{flash.status}</div>}
                        {children}
                    </main>
                </div>
                <ChatBubble />
            </div>
        </>
    );
}