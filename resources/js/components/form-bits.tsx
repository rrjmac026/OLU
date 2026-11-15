import type { ReactNode } from 'react';

type FieldProps = {
    label: string;
    error?: string;
    children: ReactNode;
};

export function Field({ label, error, children }: FieldProps) {
    return (
        <label className="olu-field">
            <span>{label}</span>
            {children}
            {error && <small className="olu-error">{error}</small>}
        </label>
    );
}

type CheckProps = {
    label: string;
    hint?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};

export function Check({ label, hint, checked, onChange }: CheckProps) {
    return (
        <label className="olu-check">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <span>
                {label}
                {hint && <small>{hint}</small>}
            </span>
        </label>
    );
}