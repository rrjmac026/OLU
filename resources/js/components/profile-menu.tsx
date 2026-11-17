import { router } from '@inertiajs/react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { AuthUser } from '../types/olu';

type Props = {
    user: AuthUser;
};

export default function ProfileMenu({ user }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const name = user.display_name ?? user.name;
    const isDark =
        user.theme === 'dark' ||
        (user.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    useEffect(() => {
        if (!open) {
            return;
        }

        function onMouseDown(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    function toggleTheme() {
        const next = isDark ? 'light' : 'dark';

        // Apply instantly, then persist to her preferences.
        document.documentElement.setAttribute('data-theme', next);
        router.patch(
            '/settings/preferences',
            { theme: next },
            { preserveScroll: true, preserveState: true, only: ['auth'] },
        );
    }

    function logout() {
        router.post('/logout');
    }

    return (
        <div className="olu-profile" ref={ref}>
            <button
                type="button"
                className="olu-profile-btn"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                <span className="olu-avatar">{name.charAt(0).toUpperCase()}</span>
                <span className="olu-profile-name">{name}</span>
            </button>

            {open && (
                <div className="olu-menu" role="menu">
                    <div className="olu-menu-head">
                        <span className="olu-avatar big">{name.charAt(0).toUpperCase()}</span>
                        <div className="olu-menu-who">
                            <strong>{name}</strong>
                            <small>{user.email}</small>
                        </div>
                    </div>

                    <div className="olu-menu-list">
                        <button type="button" role="menuitem" className="olu-menu-item" onClick={toggleTheme}>
                            <span className="olu-menu-label">
                                {isDark ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
                                Dark mode
                            </span>
                            <span className={`olu-switch ${isDark ? 'on' : ''}`} aria-hidden="true" />
                        </button>
                        <button type="button" role="menuitem" className="olu-menu-item danger" onClick={logout}>
                            <span className="olu-menu-label">
                                <LogOut size={18} aria-hidden="true" />
                                Log out
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}