import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field } from '../../components/form-bits';
import SettingsTabs from '../../components/settings-tabs';
import AppLayout from '../../layouts/app-layout';

type Props = {
    profile: {
        display_name: string;
        nickname: string | null;
        birthday: string | null;
        bio: string | null;
        timezone: string;
    };
};

export default function Profile({ profile }: Props) {
    const form = useForm({
        display_name: profile.display_name,
        nickname: profile.nickname ?? '',
        birthday: profile.birthday ?? '',
        bio: profile.bio ?? '',
        timezone: profile.timezone,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.patch('/settings/profile', { preserveScroll: true });
    }

    return (
        <AppLayout title="Profile">
            <SettingsTabs />
            <form className="olu-card" onSubmit={submit}>
                <h3>Profile</h3>
                <Field label="Display name" error={form.errors.display_name}>
                    <input
                        type="text"
                        value={form.data.display_name}
                        onChange={(e) => form.setData('display_name', e.target.value)}
                    />
                </Field>
                <Field label="Nickname" error={form.errors.nickname}>
                    <input
                        type="text"
                        value={form.data.nickname}
                        onChange={(e) => form.setData('nickname', e.target.value)}
                    />
                </Field>
                <Field label="Birthday" error={form.errors.birthday}>
                    <input
                        type="date"
                        value={form.data.birthday}
                        onChange={(e) => form.setData('birthday', e.target.value)}
                    />
                </Field>
                <Field label="Bio" error={form.errors.bio}>
                    <textarea
                        rows={3}
                        value={form.data.bio}
                        onChange={(e) => form.setData('bio', e.target.value)}
                    />
                </Field>
                <Field label="Timezone (e.g. UTC, Europe/London)" error={form.errors.timezone}>
                    <input
                        type="text"
                        value={form.data.timezone}
                        onChange={(e) => form.setData('timezone', e.target.value)}
                    />
                </Field>
                <button className="olu-btn" type="submit" disabled={form.processing}>
                    Save
                </button>
            </form>
        </AppLayout>
    );
}