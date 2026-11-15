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
            <h1>Edit memory</h1>
            <MemoryForm memory={memory} moments={moments} defaultVisibility={default_visibility} />
        </AppLayout>
    );
}