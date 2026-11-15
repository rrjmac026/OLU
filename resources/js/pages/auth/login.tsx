import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field } from '../../components/form-bits';
import GuestLayout from '../../layouts/guest-layout';

export default function Login() {
    const form = useForm({ email: '', password: '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/login', { onFinish: () => form.reset('password') });
    }

    return (
        <GuestLayout title="Log in">
            <form className="olu-card" onSubmit={submit}>
                <h2>Our Little Universe</h2>
                <Field label="Email" error={form.errors.email}>
                    <input
                        type="email"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        autoComplete="username"
                        autoFocus
                    />
                </Field>
                <Field label="Password" error={form.errors.password}>
                    <input
                        type="password"
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        autoComplete="current-password"
                    />
                </Field>
                <button className="olu-btn" type="submit" disabled={form.processing}>
                    Log in
                </button>
            </form>
        </GuestLayout>
    );
}