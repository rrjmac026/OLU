import { useForm } from '@inertiajs/react';
import { Image as ImageIcon, RotateCcw, Sparkle, Upload, UploadCloud, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MAX_BYTES, TYPES } from '../constants';
import type { BackgroundRow } from '../types';

type Props = {
    active: BackgroundRow | null;
    currentName: string;
    onClear: () => void;
};

export function UploadPanel({ active, currentName, onClear }: Props) {
    const [inputKey, setInputKey] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [drag, setDrag] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const form = useForm({ image: null as File | null, activate: true });

    useEffect(() => {
        if (!file) {
            setFileUrl(null);
            return;
        }
        const u = URL.createObjectURL(file);
        setFileUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [file]);

    const pick = (f: File | null) => {
        setLocalError(null);
        if (!f) {
            setFile(null);
            form.setData('image', null);
            return;
        }
        if (!TYPES.includes(f.type)) {
            setLocalError('Please choose a JPG, PNG or WebP image.');
            return;
        }
        if (f.size > MAX_BYTES) {
            setLocalError('That image is over 8 MB.');
            return;
        }
        setFile(f);
        form.setData('image', f);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/backgrounds', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setFile(null);
                setInputKey((k) => k + 1);
            },
        });
    };

    return (
        <section className="bk-panel">
            <div className="bk-up">
                <div>
                    <div className="bk-head">
                        <h2>
                            <Sparkle size={20} />
                            Upload Your Own
                        </h2>
                    </div>
                    <p className="bk-desc">Use a custom background image (PNG, JPG, WebP - up to 8 MB).</p>

                    <form onSubmit={submit} className="bk-up-row">
                        <label
                            className={`bk-drop ${drag ? 'drag' : ''} ${file ? 'has' : ''}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDrag(true);
                            }}
                            onDragLeave={() => setDrag(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDrag(false);
                                pick(e.dataTransfer.files?.[0] ?? null);
                            }}
                        >
                            <input
                                key={inputKey}
                                type="file"
                                className="bk-file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => pick(e.target.files?.[0] ?? null)}
                            />
                            {file && fileUrl ? (
                                <>
                                    <img src={fileUrl} alt="" className="bk-drop-thumb" />
                                    <span className="bk-drop-name">{file.name}</span>
                                    <small>{(file.size / 1048576).toFixed(1)} MB - click to change</small>
                                    <button
                                        type="button"
                                        className="bk-drop-x"
                                        aria-label="Remove picture"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            pick(null);
                                            setInputKey((k) => k + 1);
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={38} />
                                    <span>
                                        <strong>Choose File</strong> or Drag &amp; Drop
                                    </span>
                                    <small>Your image will be used as the background.</small>
                                </>
                            )}
                        </label>

                        <div className="bk-up-side">
                            <label className="bk-check">
                                <input type="checkbox" checked={form.data.activate} onChange={(e) => form.setData('activate', e.target.checked)} />
                                Use it right away
                            </label>
                            <button type="submit" className="bk-upload-btn" disabled={form.processing || !file}>
                                <Upload size={18} />
                                {form.processing ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </form>
                    {(form.errors.image || localError) && <p className="bk-error">{form.errors.image ?? localError}</p>}
                </div>

                <aside className="bk-current">
                    <h3>
                        <ImageIcon size={17} />
                        Current Background
                    </h3>
                    <div className="bk-current-img">
                        {active && <img src={`/backgrounds/${active.id}/image`} alt="" />}
                        {active && (
                            <button type="button" className="bk-current-reset" onClick={onClear} aria-label="Use the default gradient" title="Use the default gradient">
                                <RotateCcw size={16} />
                            </button>
                        )}
                    </div>
                    <small>
                        <strong>{currentName}</strong>
                        <br />
                        Shown behind the log-in screen, so anyone who visits the site can see it.
                    </small>
                </aside>
            </div>
        </section>
    );
}