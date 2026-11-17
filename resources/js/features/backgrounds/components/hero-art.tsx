import { starPath } from '../scenes/helpers';

function Star({ x, y, r, cls = '' }: { x: number; y: number; r: number; cls?: string }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            <path d={starPath(r, r * 0.48)} fill="#ffc86b" stroke="#ffc86b" strokeWidth="3" strokeLinejoin="round" className={`bk-twinkle ${cls}`} />
        </g>
    );
}

export function HeroArt() {
    return (
        <svg className="bk-hero-art" viewBox="0 0 760 250" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">
            <defs>
                <linearGradient id="bk-cloud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f6aee3" />
                    <stop offset="1" stopColor="#9a63c8" />
                </linearGradient>
                <linearGradient id="bk-cat" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fff3fb" />
                    <stop offset="1" stopColor="#efc4e8" />
                </linearGradient>
                <linearGradient id="bk-trail" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#fff" stopOpacity=".9" />
                </linearGradient>
                <filter id="bk-blur" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="9" />
                </filter>
                <mask id="bk-moon-mask">
                    <rect x="620" y="0" width="140" height="130" fill="#fff" />
                    <circle cx="704" cy="52" r="26" fill="#000" />
                </mask>
            </defs>

            <line x1="140" y1="175" x2="350" y2="48" stroke="url(#bk-trail)" strokeWidth="2.5" strokeLinecap="round" />
            <Star x={352} y={46} r={17} />

            <circle cx="690" cy="60" r="40" fill="#ffe9b0" opacity=".35" filter="url(#bk-blur)" />
            <circle cx="690" cy="60" r="30" fill="#ffe9b0" mask="url(#bk-moon-mask)" />

            <Star x={470} y={80} r={12} cls="d2" />
            <Star x={250} y={120} r={9} cls="d3" />
            <Star x={420} y={170} r={14} />
            <Star x={712} y={196} r={20} cls="d2" />

            <ellipse cx="120" cy="250" rx="150" ry="40" fill="url(#bk-cloud)" opacity=".5" />
            <circle cx="60" cy="214" r="40" fill="url(#bk-cloud)" opacity=".5" />
            <g fill="url(#bk-cloud)">
                <ellipse cx="480" cy="264" rx="340" ry="50" />
                <circle cx="330" cy="228" r="46" />
                <circle cx="410" cy="214" r="60" />
                <circle cx="520" cy="212" r="66" />
                <circle cx="630" cy="224" r="52" />
                <circle cx="710" cy="236" r="46" />
            </g>

            <g className="bk-breathe" style={{ transformOrigin: '560px 200px' }}>
                <path d="M652 190 Q706 188 700 226 Q694 242 668 232" fill="none" stroke="#f3c1e4" strokeWidth="14" strokeLinecap="round" />
                <ellipse cx="590" cy="178" rx="92" ry="40" fill="url(#bk-cat)" stroke="#e6b4de" strokeOpacity=".6" />
                <ellipse cx="612" cy="166" rx="18" ry="11" fill="#e9a9d4" opacity=".6" />
                <ellipse cx="650" cy="186" rx="14" ry="9" fill="#e9a9d4" opacity=".55" />
                <circle cx="534" cy="152" r="40" fill="url(#bk-cat)" stroke="#e6b4de" strokeOpacity=".6" />
                <path d="M505 128 L507 96 L531 118Z" fill="url(#bk-cat)" stroke="#e6b4de" strokeOpacity=".6" strokeLinejoin="round" />
                <path d="M540 116 L564 96 L566 130Z" fill="url(#bk-cat)" stroke="#e6b4de" strokeOpacity=".6" strokeLinejoin="round" />
                <path d="M510 124 L512 108 L524 118Z" fill="#f7a8cf" opacity=".8" />
                <path d="M548 118 L560 108 L561 126Z" fill="#f7a8cf" opacity=".8" />
                <path d="M517 154 Q524 161 531 154" fill="none" stroke="#7a4a8a" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M541 154 Q548 161 555 154" fill="none" stroke="#7a4a8a" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M531 163 L539 163 L535 168Z" fill="#f08fb8" />
                <ellipse cx="512" cy="165" rx="7" ry="4.5" fill="#ff9fcf" opacity=".6" />
                <ellipse cx="558" cy="165" rx="7" ry="4.5" fill="#ff9fcf" opacity=".6" />
                <ellipse cx="556" cy="194" rx="16" ry="9" fill="url(#bk-cat)" stroke="#e6b4de" strokeOpacity=".6" />
            </g>
        </svg>
    );
}