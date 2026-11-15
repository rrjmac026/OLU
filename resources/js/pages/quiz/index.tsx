import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Field } from '@/components/form-bits';
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

export default function Index({ play, mine }: { play: PlayRow[]; mine: MineRow[] }) {
    const [tab, setTab] = useState<Tab>('play');

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

    const submit = (e: React.FormEvent) => {
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

    const optionErrors = Object.entries(form.errors)
        .filter(([key]) => key.startsWith('options'))
        .map(([, msg]) => msg);

    return (
        <AppLayout title="Couple quiz">
            <h1>Couple quiz 💞</h1>

            <div className="bucket-tabs">
                <button className={tab === 'play' ? 'active' : ''} onClick={() => setTab('play')}>
                    Guess ({play.length})
                </button>
                <button className={tab === 'mine' ? 'active' : ''} onClick={() => setTab('mine')}>
                    My questions ({mine.length})
                </button>
            </div>

            {tab === 'play' && (
                <>
                    {play.length === 0 && <p>Nothing to guess yet. Questions will show up here when they add some. 🌠</p>}

                    {answered.length > 0 && (
                        <div className="quiz-summary">
                            <span>
                                You matched {matchedCount} of {answered.length} so far 💗
                            </span>
                            <button type="button" className="olu-btn" onClick={reset}>
                                Play again
                            </button>
                        </div>
                    )}

                    <div className="quiz-list">
                        {play.map((p) => (
                            <div key={p.id} className="olu-card">
                                <span className="quiz-about">about {p.about}</span>
                                <p className="qa-question">{p.question}</p>

                                <div className="quiz-options">
                                    {p.options.map((opt, i) => {
                                        const isCorrect = p.guessed && p.correct === i;
                                        const isMine = p.guessed && p.my_choice === i;
                                        const cls = [
                                            'quiz-option',
                                            isCorrect ? 'is-correct' : '',
                                            isMine && !isCorrect ? 'is-missed' : '',
                                        ].join(' ');

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                className={cls}
                                                disabled={p.guessed}
                                                onClick={() => guess(p.id, i)}
                                            >
                                                {opt}
                                                {isCorrect && ' ✅'}
                                                {isMine && !isCorrect && ' 🤍'}
                                            </button>
                                        );
                                    })}
                                </div>

                                {p.guessed && (
                                    <p className="quiz-result">
                                        {p.matched ? '💗 You know them so well!' : '🤍 Now you know!'}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {tab === 'mine' && (
                <>
                    <form onSubmit={submit} className="olu-card">
                        <Field label="A question about you" error={form.errors.question}>
                            <input
                                type="text"
                                maxLength={200}
                                placeholder="What is my favorite comfort food?"
                                value={form.data.question}
                                onChange={(e) => form.setData('question', e.target.value)}
                            />
                        </Field>

                        <Field label="Options (2 to 4) · tick the right one" error={optionErrors[0] ?? form.errors.correct}>
                            <div className="quiz-form-options">
                                {form.data.options.map((opt, i) => (
                                    <label key={i} className="quiz-form-option">
                                        <input
                                            type="radio"
                                            name="correct"
                                            checked={form.data.correct === i}
                                            onChange={() => form.setData('correct', i)}
                                        />
                                        <input
                                            type="text"
                                            maxLength={100}
                                            placeholder={`Option ${i + 1}${i > 1 ? ' (optional)' : ''}`}
                                            value={opt}
                                            onChange={(e) => setOption(i, e.target.value)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </Field>

                        <button type="submit" className="olu-btn" disabled={form.processing}>
                            Add question
                        </button>
                    </form>

                    {mine.length === 0 && <p>You have not added any questions yet. ✨</p>}

                    <div className="quiz-list">
                        {mine.map((m) => (
                            <div key={m.id} className="olu-card">
                                <div className="quiz-mine-head">
                                    <p className="qa-question">{m.question}</p>
                                    <button type="button" className="bucket-remove" onClick={() => remove(m.id)}>
                                        ✕
                                    </button>
                                </div>

                                <ul className="quiz-mine-options">
                                    {m.options.map((opt, i) => (
                                        <li key={i} className={i === m.correct ? 'is-correct-text' : ''}>
                                            {opt}
                                            {i === m.correct && ' ✅'}
                                        </li>
                                    ))}
                                </ul>

                                <p className="quiz-result">
                                    {!m.answered
                                        ? 'Not answered yet'
                                        : m.matched
                                          ? '💗 They got it!'
                                          : `🤍 They picked: ${m.options[m.their_choice ?? 0]}`}
                                </p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </AppLayout>
    );
}