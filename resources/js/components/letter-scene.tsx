import type { CSSProperties } from 'react';
import type { LetterRow } from '@/lib/letters';

export type SceneKey = 'sad' | 'miss_me' | 'encouragement' | 'happy' | 'cant_sleep' | 'love';

export function sceneFor(l: Pick<LetterRow, 'kind' | 'occasion'>): SceneKey {
    return l.kind === 'open_when' && l.occasion ? l.occasion : 'love';
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const mod = (i: number, m: number, a: number) => (i * a + 7) % m;
const css = (o: Record<string, string>) => o as CSSProperties;

const CONFETTI = ['#ff5f7e', '#ffd25f', '#6bd6a0', '#6bb8ff', '#b48cff', '#ff9ccd'];

export default function LetterScene({ scene }: { scene: SceneKey }) {
    return (
        <span className={`lt-scene s-${scene}`} aria-hidden="true">
            {scene === 'sad' && (
                <>
                    <span className="sc-cloud c1" />
                    <span className="sc-cloud c2" />
                    {range(18).map((i) => (
                        <span
                            key={i}
                            className="sc-drop"
                            style={css({
                                '--x': `${mod(i, 90, 37) + 4}%`,
                                '--d': `-${(mod(i, 100, 53) / 100) * 1.4}s`,
                                '--s': `${0.75 + mod(i, 5, 3) * 0.12}s`,
                            })}
                        />
                    ))}
                    <span className="sc-puddle" />
                    <span className="sc-flash" />
                </>
            )}

            {scene === 'miss_me' && (
                <>
                    <span className="sc-arc" />
                    <span className="sc-star a">&#10022;</span>
                    <span className="sc-star b">&#10022;</span>
                    <span className="sc-fly">&#9829;</span>
                </>
            )}

            {scene === 'encouragement' && (
                <>
                    <span className="sc-rays" />
                    <span className="sc-sun" />
                    <span className="sc-hill h1" />
                    <span className="sc-hill h2" />
                    <span className="sc-spark" style={css({ '--x': '18%', '--y': '24%' })}>&#10022;</span>
                    <span className="sc-spark" style={css({ '--x': '78%', '--y': '18%', '--d': '-1s' })}>&#10022;</span>
                    <span className="sc-spark" style={css({ '--x': '64%', '--y': '40%', '--d': '-2s' })}>&#10022;</span>
                </>
            )}

            {scene === 'happy' && (
                <>
                    <span className="sc-rainbow" />
                    <span className="sc-cloud c1" />
                    <span className="sc-cloud c2" />
                    {range(12).map((i) => (
                        <span
                            key={i}
                            className="sc-conf"
                            style={css({
                                '--x': `${mod(i, 90, 29) + 4}%`,
                                '--c': CONFETTI[i % CONFETTI.length],
                                '--d': `-${(mod(i, 100, 41) / 100) * 1.2}s`,
                            })}
                        />
                    ))}
                </>
            )}

            {scene === 'cant_sleep' && (
                <>
                    {range(12).map((i) => (
                        <span
                            key={i}
                            className="sc-tw"
                            style={css({
                                '--x': `${mod(i, 92, 23) + 3}%`,
                                '--y': `${mod(i, 60, 17) + 4}%`,
                                '--d': `-${(mod(i, 100, 31) / 100) * 3}s`,
                            })}
                        />
                    ))}
                    <span className="sc-moon" />
                    <span className="sc-shoot" />
                    <span className="sc-z" style={css({ '--d': '0s', '--f': '.8rem' })}>z</span>
                    <span className="sc-z" style={css({ '--d': '-1.3s', '--f': '1rem' })}>Z</span>
                    <span className="sc-z" style={css({ '--d': '-2.6s', '--f': '.7rem' })}>z</span>
                </>
            )}

            {scene === 'love' && (
                <>
                    <span className="sc-bigheart">&#9829;</span>
                    {range(10).map((i) => (
                        <span
                            key={i}
                            className="sc-fh"
                            style={css({
                                '--x': `${mod(i, 88, 31) + 5}%`,
                                '--z': `${0.6 + mod(i, 5, 3) * 0.12}rem`,
                                '--d': `-${(mod(i, 100, 17) / 100) * 3}s`,
                                '--s': `${2.6 + mod(i, 4, 3) * 0.5}s`,
                            })}
                        >
                            &#9829;
                        </span>
                    ))}
                </>
            )}
        </span>
    );
}