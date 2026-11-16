import { Pencil } from 'lucide-react';
import MemoryForm from '@/components/memory-form';
import AppLayout from '@/layouts/app-layout';
import type { MemoryRow, MomentOption } from '@/lib/memories';

type Props = {
    memory: MemoryRow;
    moments: MomentOption[];
    default_visibility: 'private' | 'shared';
};

export default function Edit({ memory, moments, default_visibility }: Props) {
    return (
        <AppLayout title="Edit memory">
            <div className="me narrow">
                <section className="jr-hero">
                    <div>
                        <span className="home-pill">
                            <Pencil size={16} aria-hidden="true" /> Memories
                        </span>
                        <h1 className="jr-title">
                            Edit <span>memory</span> <em aria-hidden="true">♡</em>
                        </h1>
                        <p className="home-sub">Change the photos, the story, anything.</p>
                    </div>
                </section>

                <MemoryForm memory={memory} moments={moments} defaultVisibility={default_visibility} />
            </div>
        </AppLayout>
    );
}