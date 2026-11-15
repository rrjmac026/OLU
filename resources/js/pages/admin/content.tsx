import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import AppLayout from '../../layouts/app-layout';
import { contentKinds } from '../../lib/content';
import type { ContentKind } from '../../lib/content';

type Item = { id: number; body: string; is_active: boolean };

type Props = {
    kind: ContentKind;
    counts: Record<ContentKind, number>;
    items: Item[];
};

function Row({ item }: { item: Item }) {
    const [editing, setEditing] = useState(false);
    const [body, setBody] = useState(item.body);
    const [error, setError] = useState<string | null>(null);

    function save() {
        router.patch(
            `/admin/content/${item.id}`,
            { body },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditing(false);
                    setError(null);
                },
                onError: (errs) => setError(errs.body ?? 'Could not save.'),
            },
        );
    }

    function cancel() {
        setBody(item.body);
        setEditing(false);
        setError(null);
    }

    function toggle() {
        router.patch(`/admin/content/${item.id}`, { is_active: !item.is_active }, { preserveScroll: true });
    }

    function remove() {
        if (window.confirm('Delete this one?')) {
            router.delete(`/admin/content/${item.id}`, { preserveScroll: true });
        }
    }

    return (
        <li className={`olu-content-row${item.is_active ? '' : ' off'}`}>
            {editing ? (
                <>
                    <textarea rows={2} value={body} maxLength={500} onChange={(e) => setBody(e.target.value)} />
                    {error && <span className="olu-cal-error">{error}</span>}
                    <div className="olu-content-actions">
                        <button type="button" className="olu-btn" onClick={save}>
                            Save
                        </button>
                        <button type="button" className="olu-btn" onClick={cancel}>
                            Cancel
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <span className="olu-content-body">{item.body}</span>
                    <div className="olu-content-actions">
                        <button type="button" onClick={toggle}>
                            {item.is_active ? 'Hide' : 'Show'}
                        </button>
                        <button type="button" onClick={() => setEditing(true)}>
                            Edit
                        </button>
                        <button type="button" onClick={remove}>
                            Delete
                        </button>
                    </div>
                </>
            )}
        </li>
    );
}

export default function AdminContent({ kind, counts, items }: Props) {
    const form = useForm({ body: '' });
    const current = contentKinds.find((k) => k.value === kind) ?? contentKinds[0];

    function add(e: FormEvent) {
        e.preventDefault();

        form.transform((data) => ({ ...data, kind }));
        form.post('/admin/content', {
            preserveScroll: true,
            onSuccess: () => form.reset('body'),
        });
    }

    return (
        <AppLayout title="Content">
            <h1>Content</h1>

            <div className="olu-ctabs">
                {contentKinds.map((k) => (
                    <Link
                        key={k.value}
                        href={`/admin/content?kind=${k.value}`}
                        className={k.value === kind ? 'active' : ''}
                    >
                        {k.icon} {k.label} ({counts[k.value] ?? 0})
                    </Link>
                ))}
            </div>

            <div className="olu-card">
                <p className="olu-muted">{current.hint}</p>
                <form className="olu-content-add" onSubmit={add}>
                    <textarea
                        rows={2}
                        value={form.data.body}
                        maxLength={500}
                        placeholder={`Add to ${current.label.toLowerCase()}...`}
                        onChange={(e) => form.setData('body', e.target.value)}
                    />
                    {form.errors.body && <span className="olu-cal-error">{form.errors.body}</span>}
                    <button type="submit" className="olu-btn" disabled={form.processing || !form.data.body.trim()}>
                        Add
                    </button>
                </form>

                {items.length === 0 ? (
                    <p className="olu-muted">Nothing here yet.</p>
                ) : (
                    <ul className="olu-content-list">
                        {items.map((item) => (
                            <Row key={item.id} item={item} />
                        ))}
                    </ul>
                )}
            </div>
        </AppLayout>
    );
}