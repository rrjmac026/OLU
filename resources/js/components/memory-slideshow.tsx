import { Link } from '@inertiajs/react';
import { Sparkle } from 'lucide-react';
import { useEffect, useState } from 'react';

export type MemorySlide = { id: number; memory_id: number; url: string; title: string | null };

export default function MemorySlideshow({ slides }: { slides: MemorySlide[] }) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (slides.length < 2 || paused) return;
        const t = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), 4000);
        return () => window.clearTimeout(t);
    }, [index, paused, slides.length]);

    const current = slides[index];

    return (
        <div className="home-memory">
            <div
                className="home-memory-box ms-box"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                {slides.length === 0 ? (
                    <Sparkle size={40} strokeWidth={1.3} aria-hidden="true" />
                ) : (
                    <>
                        {slides.map((s, i) => (
                            <img
                                key={s.id}
                                src={s.url}
                                alt={s.title ?? 'Memory photo'}
                                className={`ms-img ${i === index ? 'on' : ''}`}
                                loading={i === 0 ? 'eager' : 'lazy'}
                            />
                        ))}
                        {slides.length > 1 && (
                            <div className="ms-dots">
                                {slides.map((s, i) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        className={i === index ? 'on' : ''}
                                        aria-label={`Photo ${i + 1}`}
                                        onClick={() => setIndex(i)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="home-memory-text">
                <strong>{current?.title ?? 'One of my favorite days'} ♡</strong>
                <p>Some moments deserve to be remembered forever.</p>
                <Link href={current ? `/memories/${current.memory_id}` : '/memories'} className="home-btn ghost">
                    View Memory →
                </Link>
            </div>
        </div>
    );
}