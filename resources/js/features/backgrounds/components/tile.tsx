import { Check, Eye, Heart, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import { presetSrc } from '../scenes';
import type { Item } from '../types';

type Props = {
    item: Item;
    busy: boolean;
    fav: boolean;
    onUse: () => void;
    onFav: () => void;
    onView: () => void;
    onDelete?: () => void;
};

export function Tile({ item, busy, fav, onUse, onFav, onView, onDelete }: Props) {
    const [hot, setHot] = useState(false);
    const live = (hot || item.active) && item.kind === 'preset' && item.preset;

    const stop = (fn: () => void) => (e: MouseEvent) => {
        e.stopPropagation();
        fn();
    };

    const shine = (e: MouseEvent<HTMLDivElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };

    return (
        <div
            role="button"
            tabIndex={0}
            aria-pressed={item.active}
            aria-label={`Use ${item.name}`}
            className={`bk-tile ${item.active ? 'is-active' : ''}`}
            onClick={onUse}
            onMouseMove={shine}
            onMouseEnter={() => setHot(true)}
            onMouseLeave={() => setHot(false)}
            onFocus={() => setHot(true)}
            onBlur={() => setHot(false)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onUse();
                }
            }}
        >
            <img src={item.src} alt="" loading="lazy" draggable={false} />
            {live && item.preset && <img src={presetSrc(item.preset, true)} alt="" className="bk-live-img" draggable={false} />}
            {item.active && (
                <span className="bk-badge">
                    <Check size={20} strokeWidth={3} />
                </span>
            )}
            <span className="bk-tile-bar">
                <span className="bk-tile-name">{item.name}</span>
                <span className="bk-tile-tools">
                    <button type="button" className={`bk-tool ${fav ? 'on' : ''}`} onClick={stop(onFav)} aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}>
                        <Heart size={15} />
                    </button>
                    <button type="button" className="bk-tool" onClick={stop(onView)} aria-label="Preview">
                        <Eye size={15} />
                    </button>
                    {onDelete && (
                        <button type="button" className="bk-tool danger" onClick={stop(onDelete)} aria-label="Delete">
                            <Trash2 size={15} />
                        </button>
                    )}
                </span>
            </span>
            {busy && (
                <span className="bk-busy">
                    <Loader2 size={22} className="bk-spin" />
                    Applying...
                </span>
            )}
        </div>
    );
}