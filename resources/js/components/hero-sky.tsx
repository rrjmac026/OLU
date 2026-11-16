const STARS: [number, number, number][] = [
    [90, 40, 1.6], [210, 190, 1.2], [330, 60, 1.4], [450, 150, 1.1], [560, 30, 1.5],
    [700, 110, 1.3], [790, 50, 1.6], [980, 40, 1.4], [1090, 90, 1.2], [1180, 220, 1.5],
    [1290, 60, 1.3], [60, 230, 1.2], [620, 230, 1.1], [400, 100, 1.2], [1000, 160, 1.3],
];
const SPARKLE = 'M0,-1 Q0.08,-0.08 1,0 Q0.08,0.08 0,1 Q-0.08,0.08 -1,0 Q-0.08,-0.08 0,-1Z';

export default function HeroSky() {
    return (
        <svg className="home-sky" viewBox="0 0 1400 270" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
                <linearGradient id="hs-w1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#d9b7e6" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#b97fb5" stopOpacity="0.15" />
                </linearGradient>
                <linearGradient id="hs-w2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f6a6cb" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#f6a6cb" stopOpacity="0.1" />
                </linearGradient>
                <radialGradient id="hs-glow">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
            </defs>

            {STARS.map(([x, y, r], i) => (
                <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity="0.65" />
            ))}

            <path d="M440,262 C640,250 760,175 880,128 C1020,76 1150,40 1290,14" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />

            <path d="M0,270 L0,200 C120,215 220,225 330,215 C470,200 560,215 680,190 C800,165 900,110 1010,125 C1120,140 1180,190 1290,200 C1340,205 1380,195 1400,185 L1400,270 Z" fill="url(#hs-w1)" />
            <path d="M0,270 L0,240 C180,225 330,255 560,248 C780,242 960,205 1150,222 C1260,232 1340,215 1400,205 L1400,270 Z" fill="url(#hs-w2)" />

            <circle cx="880" cy="125" r="55" fill="url(#hs-glow)" />
            <g fill="#fff" transform="translate(880 125) scale(20)"><path d={SPARKLE} /></g>
            <g fill="#fff" opacity="0.85" transform="translate(1290 14) scale(9)"><path d={SPARKLE} /></g>
            <g fill="#fff" opacity="0.7" transform="translate(738 262) scale(7)"><path d={SPARKLE} /></g>
            <g fill="#fff" opacity="0.7" transform="translate(1050 70) scale(5)"><path d={SPARKLE} /></g>
        </svg>
    );
}