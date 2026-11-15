export type EventType = 'anniversary' | 'birthday' | 'date_plan' | 'reminder' | 'other';

export type CalendarEvent = {
    id: number;
    title: string;
    notes: string | null;
    date: string;
    base_date: string;
    time: string | null;
    type: EventType;
    repeats_yearly: boolean;
    visibility: 'private' | 'shared';
    mine: boolean;
    owner: string | null;
    days?: number;
};

export const eventTypes: { value: EventType; label: string; icon: string }[] = [
    { value: 'anniversary', label: 'Anniversary', icon: '💖' },
    { value: 'birthday', label: 'Birthday', icon: '🎂' },
    { value: 'date_plan', label: 'Date plan', icon: '🍽️' },
    { value: 'reminder', label: 'Reminder', icon: '🔔' },
    { value: 'other', label: 'Other', icon: '✨' },
];

export function typeInfo(type: EventType) {
    return eventTypes.find((t) => t.value === type) ?? eventTypes[eventTypes.length - 1];
}

/** Parse Y-m-d as a local date (avoids the UTC shift of new Date('2026-11-16')). */
export function parseYmd(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);

    return new Date(y, m - 1, d);
}

export function prettyDate(s: string): string {
    return parseYmd(s).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export function prettyTime(t: string): string {
    const [h, m] = t.split(':').map(Number);

    return new Date(2000, 0, 1, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function countdown(days: number): string {
    if (days === 0) return 'today';
    if (days === 1) return 'tomorrow';

    return `in ${days} days`;
}