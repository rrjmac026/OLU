import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';


type Mine = { id: number; answer: string; visibility: 'private' | 'shared' };
type Theirs = { name: string; answer: string };

type Props = {
    today: { question: string | null; mine: Mine | null; theirs: Theirs | null };
    history: { date_label: string; question: string; mine: Mine; theirs: Theirs | null }[];
    default_visibility: 'private' | 'shared';
};

const MAX = 500;

const MOODS = [
    { key: 'Loved', emoji: '🥰' },
    { key: 'Emotional', emoji: '🥹' },
    { key: 'Happy', emoji: '💖' },
    { key: 'Nostalgic', emoji: '🌷' },
];

const badge = (v: 'private' | 'shared') => (v === 'shared' ? '💞 Shared' : '🔒 Private');

export default function Index({ today, history, default_visibility }: Props) {
    const form = useForm({
        answer: today.mine?.answer ?? '',
        visibility: today.mine?.visibility ?? default_visibility,
    });
    // UI-only for now (not sent to the server)
    const [mood, setMood] = useState<string>('Loved');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/questions', { preserveScroll: true });
    };

    const remove = (id: number) => {
        if (confirm('Delete this answer?')) router.delete(`/questions/${id}`, { preserveScroll: true });
    };

    const todayLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const num = String(history.length + 1).padStart(2, '0');

    return (
        <AppLayout title="Questions">
            <div className="qx">
                {/* Hero */}
                <section className="qx-hero">
                    <div className="qx-hero-main">
                        <span className="qx-pill">✨ Our Memories</span>
                        <h1 className="qx-title">
                            Questions <span>♡</span>
                        </h1>
                        <p className="qx-sub">Little questions, meaningful conversations.</p>
                        <p className="qx-sub-2">
                            Every answer becomes another little piece of your story together. <span>♡</span>
                        </p>
                    </div>
                    <div className="qx-scene" aria-hidden>
                        <span className="moon">🌙</span>
                        <span className="star a">⭐</span>
                        <span className="star b">⭐</span>
                        <span>🐱</span>
                    </div>
                </section>

                {/* Stat strip */}
                <div className="qx-strip">
                    <div className="qx-stat">
                        <span className="qx-stat-icon">🗓️</span>
                        <div className="qx-stat-text">
                            <strong>Today&apos;s Question</strong>
                            <small>{todayLabel}</small>
                        </div>
                        <div className="qx-stat-num">
                            {num}
                            <small>of ∞</small>
                        </div>
                    </div>
                    <div className="qx-stat heart">
                        <span className="qx-stat-icon">💗</span>
                        <div className="qx-stat-text">
                            <strong>Memories to create</strong>
                            <small>Keep the story going ♡</small>
                        </div>
                    </div>
                </div>

                {today.question === null ? (
                    <div className="qx-card qx-empty">
                        <span>🌙</span>
                        <p>No question today.</p>
                    </div>
                ) : (
                    <div className="qx-main">
                        {/* Mood */}
                        <aside className="qx-card">
                            <div className="qx-mood-head">
                                <span className="qx-mood-face">☺</span>
                                <strong style={{ fontWeight: 500 }}>How does this question make you feel?</strong>
                            </div>
                            <div className="qx-moods">
                                {MOODS.map((m) => (
                                    <button
                                        key={m.key}
                                        type="button"
                                        className={`qx-mood${mood === m.key ? ' on' : ''}`}
                                        onClick={() => setMood(m.key)}
                                    >
                                        <span className="qx-mood-emoji">{m.emoji}</span>
                                        {m.key}
                                    </button>
                                ))}
                            </div>
                            <div className="qx-mood-divider">→ ♡ ←</div>
                            <p className="qx-mood-picked">
                                You selected: <span>{mood} ♡</span>
                            </p>
                        </aside>

                        {/* Question */}
                        <form onSubmit={submit} className="qx-card qx-today">
                            <div className="qx-today-top">
                                <div className="qx-card-head">⭐ Today&apos;s Question</div>
                                <span className="qx-daily">✨ Daily Prompt</span>
                            </div>

                            <div className="qx-q">
                                <span className="qx-q-heart">💗</span>
                                <h2>{today.question}</h2>
                            </div>
                            <p className="qx-q-hint">Take your time. There&apos;s no wrong answer. ♡</p>

                            <label className="qx-label" htmlFor="qx-answer">
                                ✏️ Your little thoughts
                            </label>
                            <div className="qx-box">
                                <textarea
                                    id="qx-answer"
                                    maxLength={MAX}
                                    placeholder="Write something from your heart..."
                                    value={form.data.answer}
                                    onChange={(e) => form.setData('answer', e.target.value)}
                                />
                                <span className="qx-count">
                                    {form.data.answer.length} / {MAX}
                                </span>
                            </div>
                            {form.errors.answer && <small className="qx-err">{form.errors.answer}</small>}

                            <div className="qx-foot">
                                <div className="qx-who">
                                    <span>Who can see your answer?</span>
                                    <div className="qx-vis">
                                        <button
                                            type="button"
                                            className={form.data.visibility === 'private' ? 'on' : ''}
                                            onClick={() => form.setData('visibility', 'private')}
                                        >
                                            🔒
                                            <span>
                                                Private<small>Only you</small>
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            className={form.data.visibility === 'shared' ? 'on' : ''}
                                            onClick={() => form.setData('visibility', 'shared')}
                                        >
                                            💞
                                            <span>
                                                Shared<small>Both of us</small>
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="qx-save"
                                    disabled={form.processing || !form.data.answer.trim()}
                                >
                                    ♡ {today.mine ? 'Update my answer' : 'Save my answer'} →
                                </button>
                            </div>
                            {form.errors.visibility && <small className="qx-err">{form.errors.visibility}</small>}
                        </form>
                    </div>
                )}

                {today.mine && today.theirs && (
                    <div className="qx-card qx-theirs">
                        <strong>{today.theirs.name}&apos;s answer</strong>
                        <p className="qx-text">{today.theirs.answer}</p>
                    </div>
                )}

                {!today.mine && today.question !== null && (
                    <p className="qx-note">Once you have answered, you will see theirs too, if they chose to share it.</p>
                )}

                {/* Previous */}
                {history.length > 0 && (
                    <section className="qx-card">
                        <div className="qx-prev-head">
                            <h2>📖 Our Previous Questions</h2>
                        </div>
                        <div className="qx-prev">
                            {history.map((h) => (
                                <div key={h.mine.id} className="qx-prev-card">
                                    <div className="qx-prev-date">
                                        ⭐ {h.date_label}
                                        <span className="qx-prev-badge">{badge(h.mine.visibility)}</span>
                                    </div>
                                    <p className="qx-prev-q">{h.question}</p>
                                    <p className="qx-prev-ans">
                                        <b>You:</b> {h.mine.answer}
                                    </p>
                                    {h.theirs && (
                                        <p className="qx-prev-ans">
                                            <b>{h.theirs.name}:</b> {h.theirs.answer}
                                        </p>
                                    )}
                                    <button type="button" className="qx-prev-del" onClick={() => remove(h.mine.id)} aria-label="Delete answer">
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </AppLayout>
    );
}