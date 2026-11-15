export function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function journalIcon(type: string) {
    return type === 'dream' ? '🌙' : '📖';
}

export function journalLabel(type: string) {
    return type === 'dream' ? 'Dream' : 'Diary';
}