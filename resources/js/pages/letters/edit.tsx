import '../../../css/letters.css';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Heart, Mail, PenLine } from 'lucide-react';
import LetterForm from '@/components/letter-form';
import AppLayout from '@/layouts/app-layout';
import type { LetterRow } from '@/lib/letters';

export default function Edit({ letter }: { letter: LetterRow }) {
    return (
        <AppLayout title="Edit letter">
            <div className="lt lt-narrow">
                <Link href={`/letters/${letter.id}`} className="lt-back">
                    <ArrowLeft size={16} />
                    Back to letter
                </Link>

                <section className="lt-hero sm">
                    <div className="lt-hero-text">
                        <span className="lt-pill">
                            <PenLine size={16} />
                            Editing
                            <Heart size={12} />
                        </span>
                        <h1 className="lt-title">
                            Edit letter
                            <Heart size={30} />
                        </h1>
                        <p className="lt-sub">Fix a word, add a line, make it perfect.</p>
                    </div>
                    <Mail size={112} className="lt-hero-icon" />
                </section>

                <LetterForm letter={letter} />
            </div>
        </AppLayout>
    );
}