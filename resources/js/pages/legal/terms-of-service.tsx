import '../../../css/legal.css';
import { Head, Link } from '@inertiajs/react';

export default function TermsOfService() {
    return (
        <>
            <Head title="Terms of Service" />
            <main className="legal-page">
                <div className="legal-shell">
                    <Link href="/" className="legal-back">← Back to our universe</Link>
                    <article className="legal-card">
                        <h1>Terms of Service</h1>
                        <p className="legal-updated">Last updated: November 20, 2026</p>

                        <h2>Acceptance</h2>
                        <p>By creating an account or using Our Little Universe, you agree to these Terms of Service and to use the application responsibly.</p>

                        <h2>Your account</h2>
                        <p>You are responsible for keeping your login details secure and for activity performed through your account. You must provide accurate information and follow the application&apos;s access rules.</p>

                        <h2>Use of the application</h2>
                        <p>You may use the service for personal and lawful purposes. You must not misuse it, attempt unauthorized access, interfere with availability, upload malicious content, or violate another person&apos;s rights.</p>

                        <h2>Your content</h2>
                        <p>You retain ownership of content you submit. You are responsible for ensuring that your content does not infringe the rights of others or violate applicable law.</p>

                        <h2>Shared and private features</h2>
                        <p>Features may allow account holders to share memories or information. Only use sharing options for content you are authorized to share and with people permitted to access it.</p>

                        <h2>Availability and changes</h2>
                        <p>We may update, suspend, or improve features to maintain the service. The application is provided on an available basis and is not guaranteed to be uninterrupted or error-free.</p>

                        <h2>Termination</h2>
                        <p>Access may be restricted or ended when these terms are violated, account security is at risk, or the application is discontinued. Applicable data rights remain subject to the Privacy Policy.</p>
                    </article>
                </div>
            </main>
        </>
    );
}
