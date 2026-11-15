import MemoryForm from '@/components/memory-form';
import AppLayout from '@/layouts/app-layout';
import type { MomentOption } from '@/lib/memories';

type Props = { moments: MomentOption[]; default_visibility: 'private' | 'shared' };

export default function Create({ moments, default_visibility }: Props) {
    return (
        <AppLayout title="New memory">
            <h1>New memory</h1>
            <MemoryForm moments={moments} defaultVisibility={default_visibility} />
        </AppLayout>
    );
}