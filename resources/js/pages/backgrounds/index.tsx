import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Field } from '@/components/form-bits';
import AppLayout from '@/layouts/app-layout';

type BackgroundRow = {
    id: number;
    is_active: boolean;
    is_mine: boolean;
    added_by: string;
};

export default function Index({ backgrounds }: { backgrounds: BackgroundRow[] }) {
    const [inputKey, setInputKey] = useState(0);

    const form = useForm({
        image: null as File | null,
        activate: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/backgrounds', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setInputKey((k) => k + 1);
            },
        });
    };

    const activate = (id: number) => router.post(`/backgrounds/${id}/activate`, {}, { preserveScroll: true });
    const clear = () => router.post('/backgrounds/clear', {}, { preserveScroll: true });
    const remove = (id: number) => {
        if (confirm('Delete this background?')) router.delete(`/backgrounds/${id}`, { preserveScroll: true });
    };

    const hasActive = backgrounds.some((b) => b.is_active);

    return (
        <AppLayout title="Backgrounds">
            <h1>Landing page background</h1>
            <p className="bg-hint">
                This is the picture behind the Log in screen. Either of you can change it any time. Because it shows
                before login, anyone who visits the site can see the active one, so pick something you are happy to show.
            </p>

            <form onSubmit={submit} className="olu-card">
                <Field label="Upload a picture (JPG, PNG, WebP · up to 8 MB)" error={form.errors.image}>
                    <input
                        key={inputKey}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => form.setData('image', e.target.files?.[0] ?? null)}
                    />
                </Field>
                <label className="bg-check">
                    <input
                        type="checkbox"
                        checked={form.data.activate}
                        onChange={(e) => form.setData('activate', e.target.checked)}
                    />
                    <span>Use it right away</span>
                </label>
                <button type="submit" className="olu-btn" disabled={form.processing || !form.data.image}>
                    Upload
                </button>
            </form>

            <div className="bg-toolbar">
                <button type="button" className="olu-btn" onClick={clear} disabled={!hasActive}>
                    Use the default gradient
                </button>
            </div>

            {backgrounds.length === 0 && <p>No backgrounds yet. 🖼️</p>}

            <div className="bg-grid">
                {backgrounds.map((b) => (
                    <div key={b.id} className={`bg-tile ${b.is_active ? 'is-active' : ''}`}>
                        <img src={`/backgrounds/${b.id}/image`} alt="" loading="lazy" />
                        <div className="bg-tile-body">
                            <span className="bg-sub">added by {b.added_by}</span>
                            <div className="bg-actions">
                                {b.is_active ? (
                                    <strong>✅ In use</strong>
                                ) : (
                                    <button type="button" className="olu-btn" onClick={() => activate(b.id)}>
                                        Use this
                                    </button>
                                )}
                                {b.is_mine && (
                                    <button type="button" className="bucket-remove" onClick={() => remove(b.id)}>
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}