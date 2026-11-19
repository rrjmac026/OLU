import '../../../css/legal.css';
import { Head, Link } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <>
            <Head title="Privacy Policy" />
            <main className="legal-page">
                <div className="legal-shell">
                    <Link href="/" className="legal-back">← Back to our universe</Link>
                    <article className="legal-card">
                        <h1>Privacy Policy</h1>
                        <p className="legal-updated">Last updated: November 20, 2026</p>

                        <h2>What we collect</h2>
                        <p>Our Little Universe collects the account and application information needed to provide and secure the service, including profile details, entries, memories, messages, preferences, uploads, and usage information.</p>

                        <h2>How information is used</h2>
                        <p>Information is used to operate the application, personalize your experience, protect accounts, maintain content you create, and improve reliability and features.</p>

                        <h2>Your content</h2>
                        <p>Content you add remains private unless you intentionally change its visibility or the application describes a shared feature. Private content is not intended for public access.</p>

                        <h2>Sharing and disclosure</h2>
                        <p>We do not sell personal information. Information may be disclosed when required to provide the service, comply with law, protect users, or enforce account security.</p>

                        <h2>Account controls</h2>
                        <p>You may update profile and privacy preferences while signed in. Account information and content are available only to authorized users under the permissions configured for the application.</p>

                        <h2>Data retention</h2>
                        <p>Data is retained while your account is active or as needed to operate and secure the application. Retention periods may vary based on the type of content and legal requirements.</p>

                        <h2>Changes to this policy</h2>
                        <p>We may update this Privacy Policy as the application changes. The revised date will indicate when the latest changes take effect.</p>
                    </article>
                </div>
            </main>
        </>
    );
}
