import '../../../css/quiz.css';
import { router, useForm } from '@inertiajs/react';
import { Check, HelpCircle, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';

type PlayRow = {
    id: number;
    about: string;
    question: string;
    options: string[];
    guessed: boolean;
    my_choice: number | null;
    correct: number | null;
    matched: boolean | null;
};

type MineRow = {
    id: number;
    question: string;
    options: string[];
    correct: number;
    answered: boolean;
    their_choice: number | null;
    matched: boolean | null;
};

type Tab = 'play' | 'mine';

const LETTERS = ['A', 'B', 'C', 'D'];
const GLYPHS = ['💗', '💖', '💕', '✨', '🌸', '💫'];

export default function Index({ play, mine }: { play: PlayRow[]; mine: MineRow[] }) {
    const [tab, setTab] = useState<Tab>('play');
    const [burst, setBurst] = useState(0);

    const form = useForm({
        question: '',
        options: ['', '', '', ''],
        correct: 0,
    });

    const setOption = (i: number, value: string) =>
        form.setData(
            'options',
            form.data.options.map((o, idx) => (idx === i ? value : o)),
        );

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const indexed = form.data.options
            .map((text, i) => ({ text: text.trim(), i }))
            .filter((o) => o.text !== '');
        const correct = indexed.findIndex((o) => o.i === form.data.correct);

        if (correct === -1) {
            form.setError('correct', 'Mark which option is right, and fill that option in.');
            return;
        }

        form.transform(() => ({
            question: form.data.question,
            options: indexed.map((o) => o.text),
            correct,
        }));

        form.post('/quiz/questions', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const guess = (id: number, choice: number) =>
        router.post(`/quiz/questions/${id}/guess`, { choice }, { preserveScroll: true });

    const reset = () => {
        if (confirm('Clear your answers and play again?')) router.post('/quiz/reset', {}, { preserveScroll: true });
    };

    const remove = (id: number) => {
        if (confirm('Remove this question?')) router.delete(`/quiz/questions/${id}`, { preserveScroll: true });
    };

    const answered = play.filter((p) => p.guessed);
    const matchedCount = answered.filter((p) => p.matched).length;
    const progress = play.length > 0 ? Math.round((answered.length / play.length) * 100) : 0;
    const score = answered.length > 0 ? Math.round((matchedCount / answered.length) * 100) : 0;

    /* hearts burst whenever the match count goes up */
    const prevMatched = useRef(matchedCount);
    useEffect(() => {
        if (matchedCount > prevMatched.current) {
            setBurst((b) => b + 1);
            const t = window.setTimeout(() => setBurst(0), 1800);
            prevMatched.current = matchedCount;
            return () => window.clearTimeout(t);
        }
        prevMatched.current = matchedCount;
    }, [matchedCount]);

    const optionErrors = Object.entries(form.errors)
        .filter(([key]) => key.startsWith('options'))
        .map(([, msg]) => msg);

    const filled = form.data.options.filter((o) => o.trim() !== '').length;

    return (
        <AppLayout title="Couple quiz">
            <div className="qz">
                {/* ---------- hero ---------- */}
                <section className="qz-hero">
                    <div className="qz-hero-text">
                        <span className="qz-pill">
                            <HelpCircle size={15} /> Quiz ♡
                        </span>
                        <h1>
                            Couple quiz <span className="qz-heart">♡</span>
                        </h1>
                        <p>How well do you know each other? Guess the answers, and write a few for them to guess too.</p>
                    </div>

                    <div className="qz-orb" aria-hidden="true">
                        <span className="qz-orb-ring" />
                        <span className="qz-orbit qz-orbit-a" />
                        <span className="qz-orbit qz-orbit-b" />
                        <span className="qz-orb-core">?</span>
                    </div>
                </section>

                {/* ---------- tabs ---------- */}
                <div className="qz-tabs" role="tablist">
                    <button type="button" role="tab" aria-selected={tab === 'play'} className={tab === 'play' ? 'active' : ''} onClick={() => setTab('play')}>
                        <Sparkles size={16} /> Guess <b>{play.length}</b>
                    </button>
                    <button type="button" role="tab" aria-selected={tab === 'mine'} className={tab === 'mine' ? 'active' : ''} onClick={() => setTab('mine')}>
                        <HelpCircle size={16} /> My questions <b>{mine.length}</b>
                    </button>
                </div>

                {/* ---------- GUESS ---------- */}
                {tab === 'play' && (
                    <>
                        {play.length === 0 ? (
                            <div className="qz-empty">
                                <span>🌠</span>
                                <p>Nothing to guess yet. Questions will show up here when they add some.</p>
                            </div>
                        ) : (
                            <div className="qz-summary">
                                {burst > 0 && (
                                    <div className="qz-burst" key={burst} aria-hidden="true">
                                        {Array.from({ length: 14 }, (_, i) => (
                                            <span
                                                key={i}
                                                style={
                                                    {
                                                        '--dx': `${((i * 41) % 200) - 100}px`,
                                                        '--delay': `${(i % 5) * 0.06}s`,
                                                        fontSize: 16 + (i % 4) * 5,
                                                    } as CSSProperties
                                                }
                                            >
                                                {GLYPHS[i % GLYPHS.length]}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="qz-ring" style={{ '--p': score } as CSSProperties}>
                                    <svg viewBox="0 0 44 44" aria-hidden="true">
                                        <circle cx="22" cy="22" r="19" className="qz-ring-bg" />
                                        <circle cx="22" cy="22" r="19" className="qz-ring-fg" pathLength={100} />
                                    </svg>
                                    <strong>{answered.length > 0 ? `${score}%` : '–'}</strong>
                                </div>

                                <div className="qz-summary-text">
                                    <h3>
                                        {answered.length === 0
                                            ? 'Ready when you are 💗'
                                            : `You matched ${matchedCount} of ${answered.length} so far 💗`}
                                    </h3>
                                    <div className="qz-bar">
                                        <span style={{ width: `${progress}%` }} />
                                    </div>
                                    <small>
                                        {answered.length} of {play.length} answered
                                    </small>
                                </div>

                                {answered.length > 0 && (
                                    <button type="button" className="qz-ghost" onClick={reset}>
                                        <RotateCcw size={15} /> Play again
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="qz-grid">
                            {play.map((p, n) => (
                                <article key={p.id} className={`qz-card${p.guessed ? (p.matched ? ' won' : ' lost') : ''}`} style={{ '--i': n } as CSSProperties}>
                                    <header>
                                        <span className="qz-num">{String(n + 1).padStart(2, '0')}</span>
                                        <span className="qz-about">about {p.about}</span>
                                    </header>

                                    <h2 className="qz-question">{p.question}</h2>

                                    <div className="qz-options">
                                        {p.options.map((opt, i) => {
                                            const isCorrect = p.guessed && p.correct === i;
                                            const isMine = p.guessed && p.my_choice === i;
                                            const cls = ['qz-option', isCorrect ? 'is-correct' : '', isMine && !isCorrect ? 'is-missed' : '', p.guessed && !isCorrect && !isMine ? 'is-dim' : '']
                                                .filter(Boolean)
                                                .join(' ');

                                            return (
                                                <button key={i} type="button" className={cls} disabled={p.guessed} onClick={() => guess(p.id, i)}>
                                                    <span className="qz-letter">{isCorrect ? <Check size={15} /> : LETTERS[i]}</span>
                                                    <span className="qz-opt-text">{opt}</span>
                                                    {isMine && !isCorrect && <em>🤍</em>}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {p.guessed && (
                                        <p className="qz-result">{p.matched ? '💗 You know them so well!' : '🤍 Now you know!'}</p>
                                    )}
                                </article>
                            ))}
                        </div>
                    </>
                )}

                {/* ---------- MINE ---------- */}
                {tab === 'mine' && (
                    <div className="qz-split">
                        <form onSubmit={submit} className="qz-compose" noValidate>
                            <div className="qz-compose-art" aria-hidden="true">
                                <span className="qz-compose-orb">?</span>
                                <i className="qz-sp qz-sp-1">✦</i>
                                <i className="qz-sp qz-sp-2">✦</i>
                                <i className="qz-sp qz-sp-3">✧</i>
                            </div>

                            <h3>Write a new question!</h3>
                            <p className="qz-compose-sub">Ask something only you can answer, then see if they know.</p>

                            <label className={`qz-field${form.errors.question ? ' has-error' : ''}`}>
                                <span className="qz-label">A question about you</span>
                                <input
                                    type="text"
                                    maxLength={200}
                                    placeholder="What is my favorite comfort food?"
                                    value={form.data.question}
                                    onChange={(e) => form.setData('question', e.target.value)}
                                />
                                {form.errors.question && <small className="qz-err">{form.errors.question}</small>}
                            </label>

                            <div className={`qz-field${optionErrors[0] || form.errors.correct ? ' has-error' : ''}`}>
                                <span className="qz-label">
                                    Options (2 to 4) · tap the ✓ on the right one <em>{filled}/4</em>
                                </span>
                                <div className="qz-form-options">
                                    {form.data.options.map((opt, i) => (
                                        <div key={i} className={`qz-form-option${form.data.correct === i ? ' right' : ''}`}>
                                            <button
                                                type="button"
                                                className="qz-tick"
                                                aria-pressed={form.data.correct === i}
                                                aria-label={`Mark option ${i + 1} as the right answer`}
                                                onClick={() => form.setData('correct', i)}
                                            >
                                                {form.data.correct === i ? <Check size={15} /> : LETTERS[i]}
                                            </button>
                                            <input
                                                type="text"
                                                maxLength={100}
                                                placeholder={`Option ${i + 1}${i > 1 ? ' (optional)' : ''}`}
                                                value={opt}
                                                onChange={(e) => setOption(i, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {(optionErrors[0] || form.errors.correct) && <small className="qz-err">{optionErrors[0] ?? form.errors.correct}</small>}
                            </div>

                            <button type="submit" className="qz-submit" disabled={form.processing}>
                                <Plus size={17} /> <span>{form.processing ? 'Adding…' : 'Add question'}</span>
                            </button>
                        </form>

                        <div className="qz-mine-col">
                            {mine.length === 0 && (
                                <div className="qz-empty">
                                    <span>✨</span>
                                    <p>You have not added any questions yet.</p>
                                </div>
                            )}

                            {mine.map((m, n) => (
                                <article key={m.id} className="qz-mine" style={{ '--i': n } as CSSProperties}>
                                    <div className="qz-mine-head">
                                        <h2 className="qz-question">{m.question}</h2>
                                        <button type="button" className="qz-remove" onClick={() => remove(m.id)} aria-label="Remove question">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <ul className="qz-mine-options">
                                        {m.options.map((opt, i) => (
                                            <li key={i} className={i === m.correct ? 'right' : ''}>
                                                <span className="qz-letter">{i === m.correct ? <Check size={14} /> : LETTERS[i]}</span>
                                                {opt}
                                            </li>
                                        ))}
                                    </ul>

                                    <span className={`qz-status${!m.answered ? ' wait' : m.matched ? ' yes' : ' no'}`}>
                                        {!m.answered ? 'Not answered yet' : m.matched ? '💗 They got it!' : `🤍 They picked: ${m.options[m.their_choice ?? 0]}`}
                                    </span>
                                </article>
                            ))}
                        </div>
                    </div>
                )}

                <p className="qz-foot">
                    <i>✦</i> Every question is a little way to know each other ♡ <i>✦</i>
                </p>
            </div>
        </AppLayout>
    );
}