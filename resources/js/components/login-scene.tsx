import '../../css/login-scene.css';
import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';

const GLYPHS = ['💗', '✨', '💕', '🌸', '💫', '🤍'];

export default function LoginScene() {
    const ref = useRef<HTMLDivElement>(null);

    /* deterministic values so server and client markup match */
    const stars = useMemo(
        () =>
            Array.from({ length: 48 }, (_, i) => ({
                left: (i * 37 + 11) % 100,
                top: (i * 53 + 7) % 100,
                size: 2 + (i % 3),
                delay: (i % 8) * 0.55,
                duration: 2.4 + (i % 5) * 0.7,
            })),
        [],
    );

    const hearts = useMemo(
        () =>
            Array.from({ length: 14 }, (_, i) => ({
                left: (i * 29 + 8) % 94,
                size: 14 + (i % 4) * 5,
                delay: -(i * 1.7),
                duration: 12 + (i % 5) * 2.5,
                sway: 18 + (i % 3) * 14,
                glyph: GLYPHS[i % GLYPHS.length],
            })),
        [],
    );

    /* soft glow follows the cursor */
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const move = (e: PointerEvent) => {
            el.style.setProperty('--mx', `${e.clientX}px`);
            el.style.setProperty('--my', `${e.clientY}px`);
        };
        window.addEventListener('pointermove', move);
        return () => window.removeEventListener('pointermove', move);
    }, []);

    return (
        <div className="ls-scene" ref={ref} aria-hidden="true">
            <span className="ls-blob ls-blob-a" />
            <span className="ls-blob ls-blob-b" />
            <span className="ls-blob ls-blob-c" />
            <span className="ls-cursor" />

            <div className="ls-stars">
                {stars.map((s, i) => (
                    <span
                        key={i}
                        style={
                            {
                                left: `${s.left}%`,
                                top: `${s.top}%`,
                                width: s.size,
                                height: s.size,
                                animationDelay: `${s.delay}s`,
                                animationDuration: `${s.duration}s`,
                            } as CSSProperties
                        }
                    />
                ))}
            </div>

            <span className="ls-shoot ls-shoot-a" />
            <span className="ls-shoot ls-shoot-b" />
            <span className="ls-shoot ls-shoot-c" />

            <span className="ls-moon" />

            <div className="ls-hearts">
                {hearts.map((h, i) => (
                    <span
                        key={i}
                        style={
                            {
                                left: `${h.left}%`,
                                fontSize: h.size,
                                animationDelay: `${h.delay}s`,
                                animationDuration: `${h.duration}s`,
                                '--sway': `${h.sway}px`,
                            } as CSSProperties
                        }
                    >
                        {h.glyph}
                    </span>
                ))}
            </div>
        </div>
    );
}