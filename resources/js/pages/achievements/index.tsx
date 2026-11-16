import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type Item = {
    key: string;
    emoji: string;
    title: string;
    description: string;
    unlocked_at: string | null;
};

type Props = {
    enabled: boolean;
    items: Item[];
};

export default function Achievements({ enabled, items }: Props) {
    const collected = items.filter((i) => i.unlocked_at).length;

    return (
        <AppLayout title="Achievements">
            <div className="olu-card ach">
                <h2>Achievements 🏅</h2>

                {!enabled && (
                    <p>
                        Achievements are switched off. You can turn them back on any time in{' '}
                        <Link href="/settings/preferences">Settings</Link>.
                    </p>
                )}

                {enabled && (
                    <>
                        <p className="ach-count">
                            {collected} of {items.length} collected 💗
                        </p>

                        <div className="ach-grid">
                            {items.map((item) => (
                                <div key={item.key} className={`ach-item${item.unlocked_at ? ' on' : ''}`}>
                                    <div className="ach-emoji">{item.unlocked_at ? item.emoji : '🔒'}</div>
                                    <strong>{item.title}</strong>
                                    <div className="ach-desc">{item.description}</div>
                                    {item.unlocked_at && (
                                        <div className="ach-date">
                                            {new Date(item.unlocked_at).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}