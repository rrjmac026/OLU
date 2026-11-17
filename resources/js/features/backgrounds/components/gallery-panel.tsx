import { Heart, Sparkle } from 'lucide-react';
import type { ReactNode } from 'react';
import { TABS } from '../constants';
import type { Tab } from '../types';

type Props = {
    tab: Tab;
    onTab: (t: Tab) => void;
    notice: string | null;
    isEmpty: boolean;
    children: ReactNode;
};

export function GalleryPanel({ tab, onTab, notice, isEmpty, children }: Props) {
    return (
        <section className="bk-panel">
            <div className="bk-head">
                <h2>
                    <Sparkle size={20} />
                    Choose a Default Background
                </h2>
                <div className="bk-tabs" role="tablist">
                    {TABS.map((t) => (
                        <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'on' : ''} onClick={() => onTab(t.key)}>
                            {t.key === 'fav' && <Heart size={13} />}
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {notice && <p className="bk-notice">{notice}</p>}

            <div className="bk-grid">
                {isEmpty ? <p className="bk-empty">No favorites yet. Tap the heart on any background to save it here.</p> : children}
            </div>
        </section>
    );
}