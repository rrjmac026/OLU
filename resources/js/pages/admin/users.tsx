import { router, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field } from '../../components/form-bits';
import AppLayout from '../../layouts/app-layout';
import type { SharedProps } from '../../types/olu';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    is_active: boolean;
};

type Props = {
    users: UserRow[];
};

export default function AdminUsers({ users }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const form = useForm({ name: '', email: '', password: '', role: 'user' });

    function create(e: FormEvent) {
        e.preventDefault();
        form.post('/admin/users', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    function toggle(user: UserRow) {
        router.patch(`/admin/users/${user.id}`, { is_active: !user.is_active }, { preserveScroll: true });
    }

    return (
        <AppLayout title="Users">
            <div className="olu-card">
                <h3>Accounts</h3>
                <table className="olu-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.is_active ? 'Active' : 'Disabled'}</td>
                                <td>
                                    {user.id !== auth.user?.id && (
                                        <button type="button" className="olu-link" onClick={() => toggle(user)}>
                                            {user.is_active ? 'Disable' : 'Enable'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <form className="olu-card" onSubmit={create}>
                <h3>Create account</h3>
                <Field label="Name" error={form.errors.name}>
                    <input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                </Field>
                <Field label="Email" error={form.errors.email}>
                    <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                </Field>
                <Field label="Password" error={form.errors.password}>
                    <input
                        type="password"
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        autoComplete="new-password"
                    />
                </Field>
                <Field label="Role" error={form.errors.role}>
                    <select value={form.data.role} onChange={(e) => form.setData('role', e.target.value)}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </Field>
                <button className="olu-btn" type="submit" disabled={form.processing}>
                    Create
                </button>
            </form>
        </AppLayout>
    );
}