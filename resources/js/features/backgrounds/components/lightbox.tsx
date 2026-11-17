import { Check } from 'lucide-react';
import { useEffect } from 'react';
import { presetSrc } from '../scenes';
import type { Item } from '../types';

type Props = {
    item: Item;
    onUse: (item: Item) => void;
    onClose: () => void;
};

export function Lightbox({ item, onUse, onClose }: Props) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const src = item.kind === 'preset' && item.preset ? presetSrc(item.preset, true) : item.src;

    return (
        <div className="bk-lightbox" role="dialog" aria-modal="true" aria-label="Background preview" onClick={onClose}>
            <div className="bk-lightbox-card" onClick={(e) => e.stopPropagation()}>
                <img src={src} alt="" />
                <div className="bk-lightbox-foot">
                    <strong>{item.name}</strong>
                    <div className="bk-lightbox-actions">
                        {!item.active && (
                            <button type="button" className="bk-btn" onClick={() => onUse(item)}>
                                <Check size={16} />
                                Use this background
                            </button>
                        )}
                        <button type="button" className="bk-btn ghost" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}