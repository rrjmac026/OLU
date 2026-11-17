import '../../../css/letters.css';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Heart, Mail, PenLine } from 'lucide-react';
import LetterForm from '@/components/letter-form';
import AppLayout from '@/layouts/app-layout';

export default function Create() {
    return (
        <AppLayout title="Write a letter">
            <div className="lt lt-narrow">
                <Link href="/letters" className="lt-back">
                    <ArrowLeft size={16} />
                    All letters
                </Link>

                <section className="lt-hero sm">
                    <div className="lt-hero-text">
                        <span className="lt-pill">
                            <PenLine size={16} />
                            New letter
                            <Heart size={12} />
                        </span>
                        <h1 className="lt-title">
                            Write a letter
                            <Heart size={30} />
                        </h1>
                        <p className="lt-sub">Pour your heart out and create a new memory together.</p>
                    </div>
                    <Mail size={112} className="lt-hero-icon" />
                </section>

                <LetterForm />
            </div>
        </AppLayout>
    );
}