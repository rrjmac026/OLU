import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Lock, Trash2, UploadCloud, Users, X } from 'lucide-react';
import { MAX_PHOTOS, photoUrl, type MemoryRow, type MomentOption } from '@/lib/memories';

type Props = {
    memory?: MemoryRow;
    moments: MomentOption[];
    defaultVisibility: 'private' | 'shared';
};

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

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

    const [dragging, setDragging] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);

    // live previews of the newly picked photos
    useEffect(() => {
        const urls = form.data.photos.map((f) => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [form.data.photos]);

    const kept = memory ? memory.photos.filter((p) => !form.data.remove_photos.includes(p.id)).length : 0;
    const room = Math.max(MAX_PHOTOS - kept, 0);

    const toggleRemove = (id: number) =>
        form.setData(
            'remove_photos',
            form.data.remove_photos.includes(id)
                ? form.data.remove_photos.filter((x) => x !== id)
                : [...form.data.remove_photos, id],
        );

    const addFiles = (list: FileList | File[] | null) => {
        const picked = Array.from(list ?? []).filter((f) => ALLOWED.includes(f.type));
        form.setData('photos', [...form.data.photos, ...picked].slice(0, room));
    };

    const removeNew = (index: number) =>
        form.setData(
            'photos',
            form.data.photos.filter((_, i) => i !== index),
        );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(memory ? `/memories/${memory.id}` : '/memories', { forceFormData: true });
    };

    const photoErrors = Object.entries(form.errors)
        .filter(([key]) => key.startsWith('photos'))
        .map(([, msg]) => msg);

    return (
        <form onSubmit={submit} className="home-panel jr-form">
            {memory && memory.photos.length > 0 && (
                <div>
                    <label className="ci-label">Current photos (tap to remove)</label>
                    <div className="me-tiles">
                        {memory.photos.map((p) => {
                            const removed = form.data.remove_photos.includes(p.id);
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    className={`me-tile${removed ? ' removed' : ''}`}
                                    onClick={() => toggleRemove(p.id)}
                                    aria-label={removed ? 'Keep photo' : 'Remove photo'}
                                >
                                    <img src={photoUrl(p.id)} alt="" />
                                    <span className="me-tile-badge">
                                        {removed ? 'Will be removed' : <Trash2 size={14} aria-hidden="true" />}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div>
                <label className="ci-label">Add photos ({room} left · JPG, PNG, WebP · 8 MB each)</label>
                <label
                    className={`mu-drop${dragging ? ' drag' : ''}${form.data.photos.length ? ' has' : ''}${room === 0 ? ' disabled' : ''}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (room > 0) setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        if (room > 0) addFiles(e.dataTransfer.files);
                    }}
                >
                    <input
                        type="file"
                        className="mu-file-input"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={room === 0}
                        onChange={(e) => {
                            addFiles(e.target.files);
                            e.target.value = '';
                        }}
                    />
                    <span className="mu-drop-icon">
                        <UploadCloud size={26} aria-hidden="true" />
                    </span>
                    <span className="mu-drop-text">
                        <strong>{room === 0 ? 'Photo limit reached' : 'Choose or drop your photos'}</strong>
                        <small>
                            {form.data.photos.length > 0
                                ? `${form.data.photos.length} selected`
                                : 'You can pick several at once'}
                        </small>
                    </span>
                </label>
                {photoErrors[0] && <p className="olu-cal-error">{photoErrors[0]}</p>}

                {previews.length > 0 && (
                    <div className="me-tiles new">
                        {previews.map((src, i) => (
                            <div key={src} className="me-tile static">
                                <img src={src} alt="" />
                                <button
                                    type="button"
                                    className="me-tile-x"
                                    onClick={() => removeNew(i)}
                                    aria-label="Remove this photo"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="ci-label">Caption / story</label>
                <textarea
                    className="ci-note"
                    rows={5}
                    maxLength={1000}
                    placeholder="What made this moment special?"
                    value={form.data.caption}
                    onChange={(e) => form.setData('caption', e.target.value)}
                />
                {form.errors.caption && <p className="olu-cal-error">{form.errors.caption}</p>}
            </div>

            <div className="jr-two me-two">
                <div>
                    <label className="ci-label">Date (optional)</label>
                    <input
                        type="date"
                        value={form.data.taken_on}
                        onChange={(e) => form.setData('taken_on', e.target.value)}
                    />
                    {form.errors.taken_on && <p className="olu-cal-error">{form.errors.taken_on}</p>}
                </div>
                <div>
                    <label className="ci-label">Link to a timeline moment (optional)</label>
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
                    {form.errors.timeline_moment_id && (
                        <p className="olu-cal-error">{form.errors.timeline_moment_id}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="ci-label">Who can see this?</label>
                <div className="ci-seg">
                    <button
                        type="button"
                        className={form.data.visibility === 'private' ? 'on' : ''}
                        onClick={() => form.setData('visibility', 'private')}
                    >
                        <Lock size={15} aria-hidden="true" /> Private
                    </button>
                    <button
                        type="button"
                        className={form.data.visibility === 'shared' ? 'on' : ''}
                        onClick={() => form.setData('visibility', 'shared')}
                    >
                        <Users size={15} aria-hidden="true" /> Shared
                    </button>
                </div>
                {form.errors.visibility && <p className="olu-cal-error">{form.errors.visibility}</p>}
            </div>

            <div className="jr-actions">
                <button type="submit" className="home-btn" disabled={form.processing}>
                    {form.processing ? 'Saving…' : memory ? 'Save changes ♡' : 'Save memory ♡'}
                </button>
                <Link href={memory ? `/memories/${memory.id}` : '/memories'} className="jr-cancel">
                    Cancel
                </Link>
            </div>
        </form>
    );
}