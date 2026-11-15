import LetterForm from '@/components/letter-form';
import AppLayout from '@/layouts/app-layout';
import type { LetterRow } from '@/lib/letters';

export default function Edit({ letter }: { letter: LetterRow }) {
    return (
        <AppLayout title="Edit letter">
            <h1>Edit letter</h1>
            <LetterForm letter={letter} />
        </AppLayout>
    );
}