import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type Puzzle = {
    question: string;
    hint: string | null;
    outcome: 'solved' | 'revealed' | null;
    answer: string | null;
};

type Item = {
    id: number;
    question: string;
    answer: string;
    hint: string | null;
    is_active: boolean;
};

type Props = {
    puzzle: Puzzle | null;
    isAdmin: boolean;
    items: Item[];
};

export default function PuzzlePage({ puzzle, isAdmin, items }: Props) {
    const [showHint, setShowHint] = useState(false);

    const guess = useForm({ guess: '' });
    const add = useForm({ question: '', answer: '', hint: '' });

    const submitGuess = (e: React.FormEvent) => {
        e.preventDefault();
        guess.post('/puzzle/guess', {
            preserveScroll: true,
            onSuccess: () => guess.reset(),
        });
    };

    const reveal = () => {
        router.post('/puzzle/reveal', {}, { preserveScroll: true });
    };

    const submitItem = (e: React.FormEvent) => {
        e.preventDefault();
        add.post('/puzzle/items', {
            preserveScroll: true,
            onSuccess: () => add.reset(),
        });
    };

    return (
        <AppLayout title="Daily puzzle">
            <div className="olu-card puzzle">
                <h2>Daily puzzle 🧩</h2>

                {!puzzle && <p>No puzzle today. Check back later 🤍</p>}

                {puzzle && (
                    <>
                        <p className="puzzle-q">{puzzle.question}</p>

                        {!puzzle.outcome && (
                            <>
                                <form onSubmit={submitGuess} className="puzzle-form">
                                    <input
                                        className="olu-input"
                                        value={guess.data.guess}
                                        onChange={(e) => guess.setData('guess', e.target.value)}
                                        placeholder="Your answer…"
                                        maxLength={200}
                                    />
                                    <button className="olu-btn" disabled={guess.processing}>
                                        Check
                                    </button>
                                </form>
                                {guess.errors.guess && <p className="puzzle-note">{guess.errors.guess}</p>}

                                <div className="puzzle-actions">
                                    {puzzle.hint && !showHint && (
                                        <button type="button" className="olu-btn" onClick={() => setShowHint(true)}>
                                            Hint
                                        </button>
                                    )}
                                    <button type="button" className="olu-btn" onClick={reveal}>
                                        Show answer
                                    </button>
                                </div>

                                {showHint && puzzle.hint && <p className="puzzle-note">💡 {puzzle.hint}</p>}
                            </>
                        )}

                        {puzzle.outcome === 'solved' && (
                            <p className="puzzle-result">You got it! 🎉 The answer is <strong>{puzzle.answer}</strong>.</p>
                        )}

                        {puzzle.outcome === 'revealed' && (
                            <p className="puzzle-result">The answer was <strong>{puzzle.answer}</strong>. A new one tomorrow 🤍</p>
                        )}
                    </>
                )}
            </div>

            {isAdmin && (
                <div className="olu-card puzzle-admin">
                    <h3>Manage puzzles</h3>

                    <form onSubmit={submitItem} className="puzzle-admin-form">
                        <input
                            className="olu-input"
                            value={add.data.question}
                            onChange={(e) => add.setData('question', e.target.value)}
                            placeholder="Riddle / question"
                            maxLength={500}
                        />
                        <input
                            className="olu-input"
                            value={add.data.answer}
                            onChange={(e) => add.setData('answer', e.target.value)}
                            placeholder="Answer (alternatives with |)"
                            maxLength={200}
                        />
                        <input
                            className="olu-input"
                            value={add.data.hint}
                            onChange={(e) => add.setData('hint', e.target.value)}
                            placeholder="Hint (optional)"
                            maxLength={200}
                        />
                        <button className="olu-btn" disabled={add.processing}>
                            Add puzzle
                        </button>
                        {(add.errors.question || add.errors.answer) && (
                            <p className="puzzle-note">{add.errors.question ?? add.errors.answer}</p>
                        )}
                    </form>

                    <ul className="puzzle-list">
                        {items.map((item) => (
                            <li key={item.id} className={item.is_active ? '' : 'off'}>
                                <div>
                                    <strong>{item.question}</strong>
                                    <div className="puzzle-note">→ {item.answer}</div>
                                </div>
                                <div className="puzzle-actions">
                                    <button
                                        type="button"
                                        className="olu-btn"
                                        onClick={() => router.patch(`/puzzle/items/${item.id}`, {}, { preserveScroll: true })}
                                    >
                                        {item.is_active ? 'Hide' : 'Show'}
                                    </button>
                                    <button
                                        type="button"
                                        className="olu-btn"
                                        onClick={() => {
                                            if (confirm('Delete this puzzle?')) {
                                                router.delete(`/puzzle/items/${item.id}`, { preserveScroll: true });
                                            }
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </AppLayout>
    );
}