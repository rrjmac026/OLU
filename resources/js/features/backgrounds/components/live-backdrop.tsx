import '../../../../css/live-backdrop.css';
import { useEffect, useState } from 'react';
import { getPreset, presetSrc } from '../scenes';

export function LiveBackdrop() {
    const [key, setKey] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let off = false;
        fetch('/backdrop/meta', { headers: { Accept: 'application/json' } })
            .then((r) => (r.ok ? r.json() : null))
            .then((d: { preset?: string | null } | null) => {
                if (!off && d?.preset) setKey(d.preset);
            })
            .catch(() => {
                /* keep the static background */
            });
        return () => {
            off = true;
        };
    }, []);

    const preset = key ? getPreset(key) : undefined;
    if (!preset) return null;

    return (
        <div className="lb" aria-hidden="true">
            <img src={presetSrc(preset, true)} alt="" className={`lb-img ${ready ? 'on' : ''}`} onLoad={() => setReady(true)} draggable={false} />
        </div>
    );
}