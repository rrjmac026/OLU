import LetterForm from '@/components/letter-form';
import AppLayout from '@/layouts/app-layout';

export default function Create() {
    return (
        <AppLayout title="Write a letter">
            <h1>Write a letter</h1>
            <LetterForm />
        </AppLayout>
    );
}