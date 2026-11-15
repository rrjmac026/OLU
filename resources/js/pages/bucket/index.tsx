import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Field } from '@/components/form-bits';
import AppLayout from '@/layouts/app-layout';
import { categories, categoryEmoji, type BucketCategory, type BucketRow } from '@/lib/bucket';

type Tab = 'todo' | 'done' | 'all';

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
    const shown = items.filter((i) => (tab === 'all' ? true : tab === 'done' ? i.is_done : !i.is_done));

    return (
        <AppLayout title="Bucket list">
            <h1>Our bucket list</h1>

            <form onSubmit={submit} className="olu-card">
                <Field label="What would you love to do together?" error={form.errors.title}>
                    <input
                        type="text"
                        maxLength={150}
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                    />
                </Field>
                <Field label="Category" error={form.errors.category}>
                    <select
                        value={form.data.category}
                        onChange={(e) => form.setData('category', e.target.value as BucketCategory)}
                    >
                        {categories.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.emoji} {c.label}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Note (optional)" error={form.errors.note}>
                    <input
                        type="text"
                        maxLength={500}
                        value={form.data.note}
                        onChange={(e) => form.setData('note', e.target.value)}
                    />
                </Field>
                <button type="submit" className="olu-btn" disabled={form.processing}>
                    Add
                </button>
            </form>

            <div className="bucket-tabs">
                <button className={tab === 'todo' ? 'active' : ''} onClick={() => setTab('todo')}>
                    To do
                </button>
                <button className={tab === 'done' ? 'active' : ''} onClick={() => setTab('done')}>
                    Done ({doneCount})
                </button>
                <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>
                    All
                </button>
            </div>

            {shown.length === 0 && <p>Nothing here yet. 🌠</p>}

            <div className="bucket-list">
                {shown.map((i) => (
                    <div key={i.id} className={`bucket-item ${i.is_done ? 'is-done' : ''}`}>
                        <button
                            type="button"
                            className="bucket-check"
                            onClick={() => toggle(i.id)}
                            aria-label={i.is_done ? 'Mark as not done' : 'Mark as done'}
                        >
                            {i.is_done ? '✅' : '⬜'}
                        </button>
                        <div className="bucket-text">
                            <strong>
                                {categoryEmoji(i.category)} {i.title}
                            </strong>
                            {i.note && <span className="bucket-sub">{i.note}</span>}
                            <span className="bucket-sub">
                                added by {i.added_by}
                                {i.is_done && i.done_label ? ` · done ${i.done_label}` : ''}
                            </span>
                        </div>
                        {i.is_mine && (
                            <button type="button" className="bucket-remove" onClick={() => remove(i.id)}>
                                ✕
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}