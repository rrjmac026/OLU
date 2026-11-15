import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Check, Field } from '../../components/form-bits';
import SettingsTabs from '../../components/settings-tabs';
import AppLayout from '../../layouts/app-layout';

type Props = {
    privacy: {
        share_usage_summary: boolean;
        default_entry_visibility: string;
    };
    visibility: {
        private_by_default: string[];
        admin_can_see: string[];
        admin_cannot_see: string[];
    };
};

export default function Privacy({ privacy, visibility }: Props) {
    const form = useForm({
        share_usage_summary: privacy.share_usage_summary,
        default_entry_visibility: privacy.default_entry_visibility,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.patch('/settings/privacy', { preserveScroll: true });
    }

    return (
        <AppLayout title="Privacy">
            <SettingsTabs />
            <form className="olu-card" onSubmit={submit}>
                <h3>Privacy</h3>
                <Check
                    label="Share a basic feature-usage summary"
                    hint="Shows which features are used, never what you write."
                    checked={form.data.share_usage_summary}
                    onChange={(v) => form.setData('share_usage_summary', v)}
                />
                <Field label="Default visibility for new entries" error={form.errors.default_entry_visibility}>
                    <select
                        value={form.data.default_entry_visibility}
                        onChange={(e) => form.setData('default_entry_visibility', e.target.value)}
                    >
                        <option value="private">Private</option>
                        <option value="shared">Shared</option>
                    </select>
                </Field>
                <button className="olu-btn" type="submit" disabled={form.processing}>
                    Save
                </button>
            </form>

            <div className="olu-card">
                <h3>Private by default</h3>
                <ul>
                    {visibility.private_by_default.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
                <h3>The admin can see</h3>
                <ul>
                    {visibility.admin_can_see.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
                <h3>The admin cannot see</h3>
                <ul>
                    {visibility.admin_cannot_see.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </div>
        </AppLayout>
    );
}