import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import HeroScene from '@/components/hero-scene';
import AppLayout from '@/layouts/app-layout';
import { categories, categoryEmoji, type BucketCategory, type BucketRow } from '@/lib/bucket';
import '../../../css/bucket.css'; // adjust path to wherever you put bucket.css

type Tab = 'todo' | 'done' | 'all';

/* ---------- tiny inline icons ---------- */
function S({ children, fill }: { children: ReactNode; fill?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill={fill ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const HEART = 'M12 21s-7-4.5-9.3-9A5.3 5.3 0 0112 6a5.3 5.3 0 019.3 6c-2.3 4.5-9.3 9-9.3 9z';
const I = {
    gift: (
        <S>
            <rect x="3" y="8" width="18" height="4" rx="1" fill="currentColor" fillOpacity=".3" />
            <path d="M5 12v8h14v-8M12 8v12M12 8c-2 0-4-1-4-3s3-2 4 3c1-5 4-5 4-3s-2 3-4 3z" />
        </S>
    ),
    heart: (
        <S>
            <path d={HEART} />
        </S>
    ),
    heartFill: (
        <S fill>
            <path d={HEART} />
        </S>
    ),
    wand: (
        <S>
            <path d="M4 20L16 8" />
            <path d="M15 3v3M13.5 4.5h3M20 9v3M18.5 10.5h3M8 3v2M7 4h2" />
            <path d="M14 6l4 4" />
        </S>
    ),
    send: (
        <S>
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" fill="currentColor" fillOpacity=".25" />
        </S>
    ),
    grid: (
        <S>
            <rect x="3" y="3" width="7" height="7" rx="1.6" fill="currentColor" fillOpacity=".4" />
            <rect x="14" y="3" width="7" height="7" rx="1.6" fill="currentColor" fillOpacity=".4" />
            <rect x="3" y="14" width="7" height="7" rx="1.6" fill="currentColor" fillOpacity=".4" />
            <rect x="14" y="14" width="7" height="7" rx="1.6" fill="currentColor" fillOpacity=".4" />
        </S>
    ),
    note: (
        <S>
            <path d="M5 3h10l4 4v14H5z" fill="currentColor" fillOpacity=".25" />
            <path d="M15 3v4h4M8 12h8M8 16h6" />
        </S>
    ),
    chev: (
        <S>
            <path d="M6 9l6 6 6-6" />
        </S>
    ),
    check: (
        <S>
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeWidth="2.6" />
        </S>
    ),
    clock: (
        <S>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </S>
    ),
    trash: (
        <S>
            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
        </S>
    ),
};

const catLabel = (v: BucketCategory) => categories.find((c) => c.value === v)?.label ?? v;

export default function Index({ items }: { items: BucketRow[] }) {
    const [tab, setTab] = useState<Tab>('todo');

    const form = useForm({
        title: '',
        category: 'experience' as BucketCategory,
        note: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/bucket', { preserveScroll: true, onSuccess: () => form.reset() });
    };

    const toggle = (id: number) => router.post(`/bucket/${id}/toggle`, {}, { preserveScroll: true });

    const remove = (id: number) => {
        if (confirm('Remove this from the list?')) router.delete(`/bucket/${id}`, { preserveScroll: true });
    };

    const doneCount = items.filter((i) => i.is_done).length;
    const todoCount = items.length - doneCount;
    const shown = items.filter((i) => (tab === 'all' ? true : tab === 'done' ? i.is_done : !i.is_done));

    return (
        <AppLayout title="Bucket list">
            <div className="bk">
                {/* Hero */}
                <section className="bk-hero">
                    <div className="bk-hero-main">
                        <span className="bk-pill">
                            <i>{I.gift}</i>Our Bucket List
                        </span>
                        <h1 className="bk-title">Our Bucket List {I.heart}</h1>
                        <p className="bk-sub">Dream bigger, together. Add all the things we want to do! {I.heart}</p>
                    </div>
                    <HeroScene />
                </section>

                {/* Add */}
                <form onSubmit={submit} className="bk-add">
                    <div className="bk-add-head">
                        <span className="bk-star-tile">⭐</span>
                        <div>
                            <h2>What would you love to do together?</h2>
                            <p>Add a new adventure, goal, or dream to your bucket list! ✨</p>
                        </div>
                    </div>

                    <div className="bk-input-row">
                        <div className="bk-field-wrap">
                            <i>{I.wand}</i>
                            <input
                                className="bk-text"
                                type="text"
                                maxLength={150}
                                placeholder="e.g. Visit Japan together, Get a pet, Watch the Northern Lights..."
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                            />
                        </div>
                        <button type="submit" className="bk-add-btn" disabled={form.processing || !form.data.title.trim()}>
                            {I.send}Add
                        </button>
                    </div>
                    {form.errors.title && <small className="bk-err">{form.errors.title}</small>}

                    <div className="bk-fields">
                        <label>
                            <span className="bk-lbl">
                                {I.grid}Category
                            </span>
                            <span className="bk-field-wrap">
                                <i>{categoryEmoji(form.data.category)}</i>
                                <select
                                    className="bk-select"
                                    value={form.data.category}
                                    onChange={(e) => form.setData('category', e.target.value as BucketCategory)}
                                >
                                    {categories.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                                <span className="bk-chev">{I.chev}</span>
                            </span>
                            {form.errors.category && <small className="bk-err">{form.errors.category}</small>}
                        </label>

                        <label>
                            <span className="bk-lbl">
                                {I.note}Note (optional)
                            </span>
                            <span className="bk-field-wrap">
                                <i>{I.note}</i>
                                <input
                                    className="bk-text"
                                    type="text"
                                    maxLength={500}
                                    placeholder="Anything to remember?"
                                    value={form.data.note}
                                    onChange={(e) => form.setData('note', e.target.value)}
                                />
                            </span>
                            {form.errors.note && <small className="bk-err">{form.errors.note}</small>}
                        </label>

                        <div className="bk-deco" aria-hidden>
                            Let&apos;s make more
                            <br />
                            memories together! ♡
                        </div>
                    </div>
                </form>

                {/* Tabs */}
                <div className="bk-tabs">
                    <button type="button" className={tab === 'todo' ? 'on' : ''} onClick={() => setTab('todo')}>
                        To do ✨ <span className="bk-count">{todoCount}</span>
                    </button>
                    <button type="button" className={tab === 'done' ? 'on' : ''} onClick={() => setTab('done')}>
                        Done <span className="ok">{I.check}</span> <span className="bk-count">{doneCount}</span>
                    </button>
                    <button type="button" className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>
                        {I.grid}All
                    </button>
                </div>

                {/* List */}
                <section className="bk-panel">
                    <div className="bk-panel-head">
                        <span>⭐</span>Your Bucket List
                    </div>

                    {shown.length === 0 && <p className="bk-empty">Nothing here yet. 🌠</p>}

                    <div className="bk-list">
                        {shown.map((i) => (
                            <div key={i.id} className={`bk-item${i.is_done ? ' done' : ''}`}>
                                <button
                                    type="button"
                                    className="bk-check"
                                    onClick={() => toggle(i.id)}
                                    aria-label={i.is_done ? 'Mark as not done' : 'Mark as done'}
                                >
                                    {i.is_done && I.check}
                                </button>

                                <div className="bk-thumb" aria-hidden>
                                    {categoryEmoji(i.category)}
                                </div>

                                <div className="bk-body">
                                    <div className="bk-name">
                                        <span>{i.title}</span>
                                        {I.heartFill}
                                    </div>
                                    {i.note && <span className="bk-note">{i.note}</span>}
                                    <div className="bk-meta">
                                        {I.clock}
                                        <span>Added by {i.added_by}</span>
                                        {i.is_done && i.done_label && (
                                            <>
                                                <span>•</span>
                                                {I.clock}
                                                <span>Done {i.done_label}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <span className="bk-cat">
                                    {categoryEmoji(i.category)} {catLabel(i.category)}
                                </span>

                                {i.is_mine && (
                                    <button type="button" className="bk-del" onClick={() => remove(i.id)} aria-label="Remove">
                                        {I.trash}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}