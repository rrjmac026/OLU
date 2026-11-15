export const MOODS = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'loved', emoji: '🥰', label: 'Loved' },
    { value: 'excited', emoji: '🤩', label: 'Excited' },
    { value: 'calm', emoji: '😌', label: 'Calm' },
    { value: 'okay', emoji: '🙂', label: 'Okay' },
    { value: 'tired', emoji: '😴', label: 'Tired' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'anxious', emoji: '😟', label: 'Anxious' },
    { value: 'stressed', emoji: '😖', label: 'Stressed' },
] as const;

export function moodInfo(value: string) {
    return MOODS.find((m) => m.value === value) ?? { value, emoji: '❔', label: value };
}