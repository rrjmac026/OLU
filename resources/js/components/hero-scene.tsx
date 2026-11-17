/** Night-sky hero art (moon, stars, clouds, sleeping cat). Put in resources/js/components/hero-scene.tsx */
export default function HeroScene() {
    const star = 'M0-12L3.5-4 12-3.5 5.5 2.5 7.5 11 0 6.5-7.5 11-5.5 2.5-12-3.5-3.5-4Z';

    return (
        <svg className="bk-scene" viewBox="0 0 620 190" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">
            <defs>
                <linearGradient id="hsTrail" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#ffd9f3" stopOpacity=".95" />
                </linearGradient>
                <linearGradient id="hsMoon" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffe3ac" />
                    <stop offset="1" stopColor="#ff9fcb" />
                </linearGradient>
                <linearGradient id="hsStar" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffeaa0" />
                    <stop offset="1" stopColor="#ffb3d9" />
                </linearGradient>
                <linearGradient id="hsCat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#e3cdfb" />
                    <stop offset="1" stopColor="#b896ec" />
                </linearGradient>
                <filter id="hsBlur" x="-20%" y="-50%" width="140%" height="200%">
                    <feGaussianBlur stdDeviation="8" />
                </filter>
                <filter id="hsGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <mask id="hsMoonMask">
                    <rect width="620" height="190" fill="#fff" />
                    <circle cx="590" cy="40" r="32" fill="#000" />
                </mask>
            </defs>

            {/* shooting star */}
            <path d="M-10 200 Q 170 100 360 8" stroke="url(#hsTrail)" strokeWidth="2" fill="none" />
            <path d={star} transform="translate(150 98) scale(1.1)" fill="#fff" filter="url(#hsGlow)" />

            <g filter="url(#hsBlur)">
                <ellipse cx="110" cy="190" rx="160" ry="30" fill="#c77be6" opacity=".7" />
                <ellipse cx="330" cy="196" rx="180" ry="32" fill="#ff9ad7" opacity=".6" />
                <ellipse cx="560" cy="178" rx="120" ry="34" fill="#b86be2" opacity=".8" />
            </g>

            <circle cx="570" cy="56" r="38" fill="url(#hsMoon)" mask="url(#hsMoonMask)" filter="url(#hsGlow)" />

            <path d={star} transform="translate(262 58) scale(1.4)" fill="url(#hsStar)" filter="url(#hsGlow)" />
            <path d={star} transform="translate(352 108) scale(1.15)" fill="url(#hsStar)" filter="url(#hsGlow)" />
            <path d={star} transform="translate(604 150) scale(1.05)" fill="url(#hsStar)" filter="url(#hsGlow)" />
            <g fill="#fff">
                <circle cx="200" cy="40" r="1.6" />
                <circle cx="310" cy="24" r="1.2" />
                <circle cx="430" cy="34" r="1.8" />
                <circle cx="510" cy="112" r="1.3" />
                <circle cx="70" cy="70" r="1.4" />
                <circle cx="455" cy="14" r="1.2" />
            </g>

            <g transform="translate(300 62)">
                <path d="M235 84 C 264 86, 270 54, 244 48" stroke="url(#hsCat)" strokeWidth="16" strokeLinecap="round" fill="none" />
                <ellipse cx="150" cy="86" rx="96" ry="34" fill="url(#hsCat)" />
                <ellipse cx="205" cy="94" rx="34" ry="22" fill="#c9a8f2" />
                <path d="M160 56q6 14 0 26M184 60q6 14 0 24M208 66q5 10 0 20" stroke="#a37fdc" strokeWidth="5" strokeLinecap="round" fill="none" />
                <path d="M42 44L46 10 76 32Z" fill="#dcc2f8" />
                <path d="M51 38L53 21 67 32Z" fill="#ffb3d1" />
                <path d="M96 30L118 8 122 46Z" fill="#dcc2f8" />
                <path d="M105 32L116 18 117 40Z" fill="#ffb3d1" />
                <circle cx="80" cy="66" r="40" fill="#e6d3fc" />
                <path d="M72 30v10M82 28v12M92 30v10" stroke="#a37fdc" strokeWidth="3" strokeLinecap="round" />
                <path d="M57 68q9 8 18 0M89 68q9 8 18 0" stroke="#4a2a7a" strokeWidth="3" strokeLinecap="round" fill="none" />
                <ellipse cx="53" cy="82" rx="9" ry="5" fill="#ff9fc8" opacity=".75" />
                <ellipse cx="113" cy="82" rx="9" ry="5" fill="#ff9fc8" opacity=".75" />
                <path d="M76 79h10l-5 5z" fill="#ff8fb8" />
                <path d="M81 84q-5 6-10 2M81 84q5 6 10 2" stroke="#4a2a7a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <ellipse cx="74" cy="108" rx="18" ry="9" fill="#e6d3fc" />
            </g>

            <g filter="url(#hsBlur)">
                <ellipse cx="430" cy="196" rx="190" ry="20" fill="#ffa3dc" opacity=".7" />
            </g>
        </svg>
    );
}