import { ChevronLeft, ChevronRight, ScrollText } from 'lucide-react';
import ActivityFiltersBar from '@/components/activity-filters';
import AppLayout from '@/layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { getEcho } from '@/lib/echo';
import {
    actionIcon,
    formatWhen,
    shortAgent,
    type ActivityFilters,
    type ActivityLogRow,
    type Paginated,
} from '@/lib/activity';

type Props = {
    logs: Paginated<ActivityLogRow>;
    filters: ActivityFilters;
    actions: { value: string; label: string }[];
    users: { id: number; name: string }[];
};

export default function ActivityLogs({ logs, filters, actions, users }: Props) {
    const prev = logs.links[0]?.url ?? null;
    const next = logs.links[logs.links.length - 1]?.url ?? null;

    useEffect(() => {
        const echo = getEcho();
        let timer: ReturnType<typeof setTimeout> | undefined;

        echo.private('activity').listen('.activity.logged', () => {
            clearTimeout(timer);
            timer = setTimeout(() => router.reload({ only: ['logs'] }), 300);
        });

        return () => {
            clearTimeout(timer);
            echo.leave('activity');
        };
    }, []);

    return (
        <AppLayout title="Activity log">
            <div className="act">
                <section className="act-hero">
                    <div className="act-hero-main">
                        <span className="home-pill">
                            <ScrollText size={16} /> Admin
                        </span>
                        <h1 className="act-title">
                            Activity <em>log</em>
                        </h1>
                        <p className="act-sub">Who did what and when. Metadata only, private content is never recorded.</p>
                    </div>
                    <div className="act-stats">
                        <div>
                            <strong>{logs.total}</strong>
                            <small>entries</small>
                        </div>
                        <div>
                            <strong>{logs.current_page}/{logs.last_page}</strong>
                            <small>page</small>
                        </div>
                    </div>
                </section>

                <section className="home-panel act-panel">
                    <div className="home-panel-head">
                        <h2>Filters</h2>
                    </div>
                    <ActivityFiltersBar filters={filters} actions={actions} users={users} />
                </section>

                {logs.data.length === 0 ? (
                    <div className="home-panel act-empty">
                        <span>🌙</span>
                        <strong>Nothing here yet</strong>
                        <small>Activity will show up as it happens.</small>
                    </div>
                ) : (
                    <ul className="act-list">
                        {logs.data.map((log) => {
                            const fields = (log.properties?.fields as string[] | undefined) ?? [];
                            const email = log.properties?.email ? String(log.properties.email) : null;

                            return (
                                <li key={log.id} className="act-row">
                                    <span className="act-icon" aria-hidden="true">{actionIcon(log.action)}</span>

                                    <div className="act-body">
                                        <div className="act-top">
                                            {log.user ? <strong>{log.user}</strong> : <strong className="act-guest">guest</strong>}
                                            <span className={`act-badge act-badge--${log.action}`}>{log.action_label}</span>
                                        </div>
                                        <p className="act-desc">{log.description}</p>
                                        {(fields.length > 0 || email) && (
                                            <div className="act-chips">
                                                {fields.map((f) => (
                                                    <span key={f} className="act-chip">{f}</span>
                                                ))}
                                                {email && <span className="act-chip">{email}</span>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="act-side">
                                        <time dateTime={log.created_at ?? undefined}>{formatWhen(log.created_at)}</time>
                                        {log.user_agent && <small>{shortAgent(log.user_agent)}</small>}
                                        {log.ip_address && <small>{log.ip_address}</small>}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {logs.last_page > 1 && (
                    <nav className="act-pager" aria-label="Pagination">
                        {prev ? (
                            <Link href={prev} preserveScroll><ChevronLeft size={16} /> Prev</Link>
                        ) : (
                            <span className="btn"><ChevronLeft size={16} /> Prev</span>
                        )}
                        <small>Page {logs.current_page} of {logs.last_page}</small>
                        {next ? (
                            <Link href={next} preserveScroll>Next <ChevronRight size={16} /></Link>
                        ) : (
                            <span className="btn">Next <ChevronRight size={16} /></span>
                        )}
                    </nav>
                )}
            </div>
        </AppLayout>
    );
}