export type ContentKind = 'question' | 'compliment' | 'comfort' | 'reason';

export const contentKinds: { value: ContentKind; label: string; icon: string; hint: string }[] = [
    { value: 'question', label: 'Daily questions', icon: '❓', hint: 'One shows up on Home each day.' },
    { value: 'compliment', label: 'Compliments', icon: '💌', hint: 'Shown on Home as the daily reminder.' },
    { value: 'comfort', label: 'Comfort messages', icon: '🫶', hint: 'Shown when she opens the Comfort corner.' },
    { value: 'reason', label: 'Reasons I love you', icon: '💗', hint: 'Listed on her Reasons page. Add new ones anytime.' },
];