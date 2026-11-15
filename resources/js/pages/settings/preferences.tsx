import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Check, Field } from '../../components/form-bits';
import SettingsTabs from '../../components/settings-tabs';
import AppLayout from '../../layouts/app-layout';

type Props = {
    settings: {
        theme: string;
        notifications_enabled: boolean;
        notification_previews: boolean;
        gamification_enabled: boolean;
    };
};

export default function Preferences({ settings }: Props) {
    const form = useForm({
        theme: settings.theme,
        notifications_enabled: settings.notifications_enabled,
        notification_previews: settings.notification_previews,
        gamification_enabled: settings.gamification_enabled,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.patch('/settings/preferences', { preserveScroll: true });
    }

    return (
        <AppLayout title="Preferences">
            <SettingsTabs />
            <form className="olu-card" onSubmit={submit}>
                <h3>Preferences</h3>
                <Field label="Theme" error={form.errors.theme}>
                    <select value={form.data.theme} onChange={(e) => form.setData('theme', e.target.value)}>
                        <option value="system">System</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </Field>
                <Check
                    label="Notifications"
                    checked={form.data.notifications_enabled}
                    onChange={(v) => form.setData('notifications_enabled', v)}
                />
                <Check
                    label="Show message previews in notifications"
                    hint="Off by default so private content never appears in a preview."
                    checked={form.data.notification_previews}
                    onChange={(v) => form.setData('notification_previews', v)}
                />
                <Check
                    label="Games, garden and rewards"
                    hint="Turn off to hide all gamified features."
                    checked={form.data.gamification_enabled}
                    onChange={(v) => form.setData('gamification_enabled', v)}
                />
                <button className="olu-btn" type="submit" disabled={form.processing}>
                    Save
                </button>
            </form>
        </AppLayout>
    );
}