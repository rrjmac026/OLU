import { Camera } from 'lucide-react';
import MemoryForm from '@/components/memory-form';
import AppLayout from '@/layouts/app-layout';
import type { MomentOption } from '@/lib/memories';

type Props = { moments: MomentOption[]; default_visibility: 'private' | 'shared' };

export default function Create({ moments, default_visibility }: Props) {
    return (
        <AppLayout title="New memory">
            <div className="me narrow">
                <section className="jr-hero">
                    <div>
                        <span className="home-pill">
                            <Camera size={16} aria-hidden="true" /> Memories
                        </span>
                        <h1 className="jr-title">
                            New <span>memory</span> <em aria-hidden="true">♡</em>
                        </h1>
                        <p className="home-sub">Add photos and tell the story behind them.</p>
                    </div>
                </section>

                <MemoryForm moments={moments} defaultVisibility={default_visibility} />
            </div>
        </AppLayout>
    );
}