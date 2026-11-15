import { useForm } from '@inertiajs/react';
import { Field } from '@/components/form-bits';
import { MAX_PHOTOS, photoUrl, type MemoryRow, type MomentOption } from '@/lib/memories';

type Props = {
    memory?: MemoryRow;
    moments: MomentOption[];
    defaultVisibility: 'private' | 'shared';
};

export default function MemoryForm({ memory, moments, defaultVisibility }: Props) {
    const form = useForm({
        _method: memory ? 'put' : 'post',
        caption: memory?.caption ?? '',
        taken_on: memory?.taken_input ?? '',
        visibility: memory?.visibility ?? defaultVisibility,
        timeline_moment_id: memory?.timeline_moment_id ? String(memory.timeline_moment_id) : '',
        photos: [] as File[],
        remove_photos: [] as number[],
    });

    const kept = memory ? memory.photos.filter((p) => !form.data.remove_photos.includes(p.id)).length : 0;
    const room = Math.max(MAX_PHOTOS - kept, 0);

    const toggleRemove = (id: number) =>
        form.setData(
            'remove_photos',
            form.data.remove_photos.includes(id)
                ? form.data.remove_photos.filter((x) => x !== id)
                : [...form.data.remove_photos, id],
        );

    const onFiles = (e: React.ChangeEvent<HTMLInputElement>) =>
        form.setData('photos', Array.from(e.target.files ?? []).slice(0, room));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(memory ? `/memories/${memory.id}` : '/memories', { forceFormData: true });
    };

    const photoErrors = Object.entries(form.errors)
        .filter(([key]) => key.startsWith('photos'))
        .map(([, msg]) => msg);

    return (
        <form onSubmit={submit} className="olu-card">
            {memory && memory.photos.length > 0 && (
                <Field label="Current photos (tick to remove)">
                    <div className="memory-edit-grid">
                        {memory.photos.map((p) => (
                            <label key={p.id} className="memory-edit-photo">
                                <img src={photoUrl(p.id)} alt="" />
                                <input
                                    type="checkbox"
                                    checked={form.data.remove_photos.includes(p.id)}
                                    onChange={() => toggleRemove(p.id)}
                                />
                                <span>Remove</span>
                            </label>
                        ))}
                    </div>
                </Field>
            )}

            <Field label={`Add photos (${room} left · JPG, PNG, WebP · 8 MB each)`} error={photoErrors[0]}>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={room === 0}
                    onChange={onFiles}
                />
                {form.data.photos.length > 0 && <small>{form.data.photos.length} selected</small>}
            </Field>

            <Field label="Caption / story" error={form.errors.caption}>
                <textarea
                    rows={5}
                    maxLength={1000}
                    value={form.data.caption}
                    onChange={(e) => form.setData('caption', e.target.value)}
                />
            </Field>

            <Field label="Date (optional)" error={form.errors.taken_on}>
                <input type="date" value={form.data.taken_on} onChange={(e) => form.setData('taken_on', e.target.value)} />
            </Field>

            <Field label="Link to a timeline moment (optional)" error={form.errors.timeline_moment_id}>
                <select
                    value={form.data.timeline_moment_id}
                    onChange={(e) => form.setData('timeline_moment_id', e.target.value)}
                >
                    <option value="">No link</option>
                    {moments.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.title}
                        </option>
                    ))}
                </select>
            </Field>

            <Field label="Who can see this?" error={form.errors.visibility}>
                <select
                    value={form.data.visibility}
                    onChange={(e) => form.setData('visibility', e.target.value as 'private' | 'shared')}
                >
                    <option value="private">🔒 Private (only me)</option>
                    <option value="shared">💞 Shared</option>
                </select>
            </Field>

            <button type="submit" className="olu-btn" disabled={form.processing}>
                {memory ? 'Save changes' : 'Save memory'}
            </button>
        </form>
    );
}