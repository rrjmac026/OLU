import { Head, Link } from '@inertiajs/react';

type Props = { background: { version: number } | null };

export default function Welcome({ background }: Props) {
    const style = background ? { backgroundImage: `url(/backdrop?v=${background.version})` } : undefined;

    return (
        <>
            <Head title="Our Little Universe" />
            <div className="landing" style={style}>
                <div className="landing-overlay" />
                <main className="landing-card">
                    <h1>Our Little Universe ✨</h1>
                    <p>A cozy little corner, just for two.</p>
                    <Link href="/login" className="landing-login">
                        Log in
                    </Link>
                </main>
            </div>
        </>
    );
}