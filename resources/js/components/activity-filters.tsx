import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { ActivityFilters } from '@/lib/activity';

type Props = {
    filters: ActivityFilters;
    actions: { value: string; label: string }[];
    users: { id: number; name: string }[];
};

export default function ActivityFiltersBar({ filters, actions, users }: Props) {
    const [form, setForm] = useState<ActivityFilters>({
        action: filters.action ?? '',
        user_id: filters.user_id ?? '',
        from: filters.from ?? '',
        to: filters.to ?? '',
        search: filters.search ?? '',
    });

    const set = (key: keyof ActivityFilters, value: string) =>
        setForm((f) => ({ ...f, [key]: value }));

    const apply = () => {
        const clean = Object.fromEntries(
            Object.entries(form).filter(([, v]) => v !== '' && v != null),
        );
        router.get('/admin/activity', clean, { preserveState: true, replace: true });
    };

    const reset = () => {
        setForm({ action: '', user_id: '', from: '', to: '', search: '' });
        router.get('/admin/activity', {}, { replace: true });
    };

    return (
        <div className="act-filters">
            <input
                type="search"
                placeholder="Search description…"
                value={form.search}
                onChange={(e) => set('search', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && apply()}
            />
            <select value={form.action} onChange={(e) => set('action', e.target.value)}>
                <option value="">All actions</option>
                {actions.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                ))}
            </select>
            <select value={form.user_id} onChange={(e) => set('user_id', e.target.value)}>
                <option value="">Everyone</option>
                {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                ))}
            </select>
            <input type="date" aria-label="From" value={form.from} onChange={(e) => set('from', e.target.value)} />
            <input type="date" aria-label="To" value={form.to} onChange={(e) => set('to', e.target.value)} />
            <div className="act-filters-btns">
                <button type="button" className="home-btn" onClick={apply}>Filter</button>
                <button type="button" className="home-btn ghost" onClick={reset}>Reset</button>
            </div>
        </div>
    );
}