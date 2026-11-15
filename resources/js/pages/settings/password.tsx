import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field } from '../../components/form-bits';
import SettingsTabs from '../../components/settings-tabs';
import AppLayout from '../../layouts/app-layout';

export default function Password() {
    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <AppLayout title="Password">
            <SettingsTabs />
            <form className="olu-card" onSubmit={submit}>
                <h3>Change password</h3>
                <p className="olu-muted">Changing your password signs you out of all other devices.</p>
                <Field label="Current password" error={form.errors.current_password}>
                    <input
                        type="password"
                        value={form.data.current_password}
                        onChange={(e) => form.setData('current_password', e.target.value)}
                        autoComplete="current-password"
                    />
                </Field>
                <Field label="New password" error={form.errors.password}>
                    <input
                        type="password"
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        autoComplete="new-password"
                    />
                </Field>
                <Field label="Confirm new password">
                    <input
                        type="password"
                        value={form.data.password_confirmation}
                        onChange={(e) => form.setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                    />
                </Field>
                <button className="olu-btn" type="submit" disabled={form.processing}>
                    Update password
                </button>
            </form>
        </AppLayout>
    );
}