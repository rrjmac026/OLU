import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Field } from '@/components/form-bits';
import AppLayout from '@/layouts/app-layout';
import {
    MAX_SEGMENTS,
    SEGMENT_COLORS,
    categoryInfo,
    sample,
    segmentPath,
    shortLabel,
    wheelCategories,
    type ManagedItem,
    type WheelCategory,
    type WheelItem,
} from '@/lib/wheel';

type Props = { items: WheelItem[]; manage: ManagedItem[] | null };
type Filter = WheelCategory | 'all';

export default function Index({ items, manage }: Props) {
    const [filter, setFilter] = useState<Filter>('all');
    const poolFor = (f: Filter) => items.filter((i) => f === 'all' || i.category === f);

    const [segments, setSegments] = useState<WheelItem[]>(() => sample(poolFor('all'), MAX_SEGMENTS));
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<WheelItem | null>(null);

    const choose = (f: Filter) => {
        if (spinning) return;
        setFilter(f);
        setResult(null);
        setSegments(sample(poolFor(f), MAX_SEGMENTS));
    };

    const reshuffle = () => {
        if (spinning) return;
        setResult(null);
        setSegments(sample(poolFor(filter), MAX_SEGMENTS));
    };

    const spin = () => {
        if (spinning || segments.length < 2) return;

        const n = segments.length;
        const seg = 360 / n;
        const k = Math.floor(Math.random() * n);
        const jitter = (Math.random() - 0.5) * seg * 0.7;
        const target = -((k + 0.5) * seg) + jitter;
        const delta = (((target - rotation) % 360) + 360) % 360;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        setResult(null);
        setSpinning(true);
        setRotation(rotation + (reduce ? 0 : 360 * 5) + delta);

        window.setTimeout(
            () => {
                setResult(segments[k]);
                setSpinning(false);
            },
            reduce ? 50 : 4200,
        );
    };

    const addForm = useForm({ category: 'date' as WheelCategory, label: '' });

    const add = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/wheel/items', {
            preserveScroll: true,
            onSuccess: () => addForm.reset('label'),
        });
    };

    const toggle = (id: number) => router.patch(`/wheel/items/${id}`, {}, { preserveScroll: true });
    const remove = (id: number) => {
        if (confirm('Delete this item?')) router.delete(`/wheel/items/${id}`, { preserveScroll: true });
    };

    const n = segments.length;
    const seg = n > 0 ? 360 / n : 0;

    return (
        <AppLayout title="Random wheel">
            <h1>Random wheel 🎡</h1>

            <div className="bucket-tabs">
                <button className={filter === 'all' ? 'active' : ''} onClick={() => choose('all')}>
                    All
                </button>
                {wheelCategories.map((c) => (
                    <button key={c.value} className={filter === c.value ? 'active' : ''} onClick={() => choose(c.value)}>
                        {c.emoji} {c.label}
                    </button>
                ))}
            </div>

            {n < 2 ? (
                <p>Not enough items for this wheel yet. 🌠</p>
            ) : (
                <div className="wheel-wrap">
                    <div className="wheel-box">
                        <div className="wheel-pointer">▼</div>
                        <svg
                            className="wheel-svg"
                            viewBox="-100 -100 200 200"
                            style={{
                                transform: `rotate(${rotation}deg)`,
                                transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                            }}
                        >
                            {segments.map((s, i) => {
                                const mid = (i + 0.5) * seg;
                                return (
                                    <g key={s.id}>
                                        <path
                                            d={segmentPath(i, n)}
                                            fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                                            stroke="#fff"
                                            strokeWidth="1"
                                        />
                                        <text
                                            transform={`rotate(${mid - 90}) translate(26 0)`}
                                            fontSize="6.5"
                                            fill="#3b2a55"
                                            dominantBaseline="middle"
                                        >
                                            {categoryInfo(s.category).emoji} {shortLabel(s.label)}
                                        </text>
                                    </g>
                                );
                            })}
                            <circle r="9" fill="#fff" />
                        </svg>
                    </div>

                    <div className="wheel-actions">
                        <button type="button" className="olu-btn" onClick={spin} disabled={spinning}>
                            {spinning ? 'Spinning…' : 'Spin ✨'}
                        </button>
                        <button type="button" className="olu-btn" onClick={reshuffle} disabled={spinning}>
                            New wheel
                        </button>
                    </div>

                    {result && (
                        <div className="olu-card wheel-result">
                            <span className="quiz-about">
                                {categoryInfo(result.category).emoji} {categoryInfo(result.category).label}
                            </span>
                            <p className="qa-question">{result.label}</p>
                        </div>
                    )}
                </div>
            )}

            {manage && (
                <>
                    <h2>Manage the wheel</h2>

                    <form onSubmit={add} className="olu-card">
                        <Field label="Category" error={addForm.errors.category}>
                            <select
                                value={addForm.data.category}
                                onChange={(e) => addForm.setData('category', e.target.value as WheelCategory)}
                            >
                                {wheelCategories.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.emoji} {c.label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Idea" error={addForm.errors.label}>
                            <input
                                type="text"
                                maxLength={150}
                                value={addForm.data.label}
                                onChange={(e) => addForm.setData('label', e.target.value)}
                            />
                        </Field>
                        <button type="submit" className="olu-btn" disabled={addForm.processing || !addForm.data.label.trim()}>
                            Add to the wheel
                        </button>
                    </form>

                    <div className="bucket-list">
                        {manage.map((m) => (
                            <div key={m.id} className={`bucket-item ${m.is_active ? '' : 'is-done'}`}>
                                <div className="bucket-text">
                                    <strong>
                                        {categoryInfo(m.category).emoji} {m.label}
                                    </strong>
                                    <span className="bucket-sub">{m.is_active ? 'On the wheel' : 'Hidden'}</span>
                                </div>
                                <button type="button" className="olu-btn" onClick={() => toggle(m.id)}>
                                    {m.is_active ? 'Hide' : 'Show'}
                                </button>
                                <button type="button" className="bucket-remove" onClick={() => remove(m.id)}>
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </AppLayout>
    );
}