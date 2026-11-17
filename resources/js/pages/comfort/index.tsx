import '../../../css/comfort.css';
import { Link } from '@inertiajs/react';
import { ChevronRight, Flower2, Heart, Image as ImageIcon, Music, Sparkle } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../layouts/app-layout';
import { api } from '../../lib/http';

const DEFAULT_QUOTE = 'You are loved, you are enough, and you matter.';

const COMFORTS = [
    { href: '/chat', icon: Heart, title: 'Write a Note', desc: 'Send yourself or them a kind message \u2661' },
    { href: '/music', icon: Music, title: 'Listen to Music', desc: 'Play something that makes you happy \u266B' },
    { href: '/garden', icon: Flower2, title: 'Visit the Garden', desc: 'Take a break in your little garden \u2661' },
    { href: '/backgrounds', icon: ImageIcon, title: 'Change Background', desc: 'A new view for a brighter mood \u2661' },
];

const HEART = 'M0 10 C-22 -6 -16 -26 0 -14 C16 -26 22 -6 0 10Z';
const SPARK = 'M0 -11 Q0 0 11 0 Q0 0 0 11 Q0 0 -11 0 Q0 0 0 -11Z';

function starPath(r: number, ir: number) {
    const pts = Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rad = i % 2 ? ir : r;
        return `${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`;
    });
    return `M${pts.join('L')}Z`;
}

/* ---------- illustration bits ---------- */
function Flower({ x, y, r = 12, petal = '#ff9fcf' }: { x: number; y: number; r?: number; petal?: string }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="0" cy={-r * 0.9} rx={r * 0.55} ry={r * 0.8} transform={`rotate(${a})`} fill={petal} opacity=".95" />
            ))}
            <circle r={r * 0.38} fill="#ffe08a" />
        </g>
    );
}

function Spark({ x, y, s = 1, cls = '' }: { x: number; y: number; s?: number; cls?: string }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <path d={SPARK} fill="#ffd6ec" className={`cf-twinkle ${cls}`} />
        </g>
    );
}

function MiniHeart({ x, y, s = 0.6, cls = '' }: { x: number; y: number; s?: number; cls?: string }) {
    return (
        <g className={`cf-float ${cls}`}>
            <path d={HEART} transform={`translate(${x} ${y}) scale(${s})`} fill="#ff8cc6" opacity=".9" />
        </g>
    );
}

function HangStar({ x, y, r, delay }: { x: number; y: number; r: number; delay: number }) {
    return (
        <g className="cf-sway" style={{ transformOrigin: `${x}px 0px`, animationDelay: `${delay}s` }}>
            <line x1={x} y1={0} x2={x} y2={y} stroke="#ffd6ec" strokeOpacity=".35" />
            <path
                d={starPath(r, r * 0.48)}
                transform={`translate(${x} ${y})`}
                fill="#ffc86b"
                stroke="#ffc86b"
                strokeWidth="4"
                strokeLinejoin="round"
            />
        </g>
    );
}

function HeroArt() {
    return (
        <svg className="cf-hero-art" viewBox="0 0 720 270" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">
            <defs>
                <linearGradient id="cf-cloud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f6aee3" />
                    <stop offset="1" stopColor="#9a63c8" />
                </linearGradient>
                <linearGradient id="cf-cat" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fff3fb" />
                    <stop offset="1" stopColor="#f1c9ea" />
                </linearGradient>
                <linearGradient id="cf-pillow" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffe9b8" />
                    <stop offset="1" stopColor="#f3b98a" />
                </linearGradient>
                <filter id="cf-blur" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="9" />
                </filter>
                <mask id="cf-moon-mask">
                    <rect x="600" y="10" width="120" height="100" fill="#fff" />
                    <circle cx="669" cy="46" r="25" fill="#000" />
                </mask>
            </defs>

            {/* hanging stars */}
            <HangStar x={105} y={87} r={15} delay={0} />
            <HangStar x={227} y={70} r={12} delay={-1.5} />
            <HangStar x={306} y={88} r={15} delay={-3} />

            {/* moon */}
            <circle cx="655" cy="55" r="34" fill="#ffe9b0" opacity=".35" filter="url(#cf-blur)" />
            <circle cx="655" cy="55" r="28" fill="#ffe9b0" mask="url(#cf-moon-mask)" />

            {/* far clouds */}
            <ellipse cx="150" cy="258" rx="140" ry="38" fill="url(#cf-cloud)" opacity=".55" />
            <circle cx="700" cy="125" r="42" fill="url(#cf-cloud)" opacity=".5" />
            <ellipse cx="700" cy="160" rx="70" ry="28" fill="url(#cf-cloud)" opacity=".5" />

            {/* main cloud */}
            <g fill="url(#cf-cloud)">
                <ellipse cx="480" cy="266" rx="270" ry="42" />
                <circle cx="340" cy="232" r="40" />
                <circle cx="410" cy="222" r="52" />
                <circle cx="500" cy="218" r="58" />
                <circle cx="592" cy="228" r="46" />
                <circle cx="662" cy="238" r="44" />
            </g>

            {/* tail */}
            <path d="M566 186 Q614 190 606 226 Q600 242 576 234" fill="none" stroke="#f3c1e4" strokeWidth="14" strokeLinecap="round" />
            <path d="M566 186 Q614 190 606 226 Q600 242 576 234" fill="none" stroke="#e48fc4" strokeWidth="14" strokeLinecap="round" strokeDasharray="5 11" opacity=".8" />

            {/* cat + pillow */}
            <g className="cf-breathe" style={{ transformOrigin: '470px 205px' }}>
                <ellipse cx="495" cy="180" rx="78" ry="40" fill="url(#cf-cat)" stroke="#e6b4de" strokeOpacity=".6" />
                <path d={starPath(36, 17)} transform="translate(378 176) rotate(-8)" fill="url(#cf-pillow)" stroke="#f6c38f" strokeWidth="8" strokeLinejoin="round" />
                <circle cx="425" cy="150" r="36" fill="url(#cf-cat)" stroke="#e6b4de" strokeOpacity=".6" />
                <path d="M398 128 L402 98 L424 118Z" fill="url(#cf-cat)" stroke="#e6b4de" strokeOpacity=".6" strokeLinejoin="round" />
                <path d="M434 116 L456 98 L458 132Z" fill="url(#cf-cat)" stroke="#e6b4de" strokeOpacity=".6" strokeLinejoin="round" />
                <path d="M404 124 L406 108 L418 118Z" fill="#f7a8cf" opacity=".8" />
                <path d="M441 118 L452 108 L453 128Z" fill="#f7a8cf" opacity=".8" />
                <path d="M410 152 Q416 159 422 152" fill="none" stroke="#7a4a8a" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M432 152 Q438 159 444 152" fill="none" stroke="#7a4a8a" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M424 160 L432 160 L428 165Z" fill="#f08fb8" />
                <ellipse cx="405" cy="162" rx="7" ry="4.5" fill="#ff9fcf" opacity=".6" />
                <ellipse cx="449" cy="162" rx="7" ry="4.5" fill="#ff9fcf" opacity=".6" />
                <ellipse cx="442" cy="192" rx="17" ry="9" fill="url(#cf-cat)" stroke="#e6b4de" strokeOpacity=".6" />
            </g>

            {/* zzz */}
            <text className="cf-z" x="468" y="118" fontSize="16">z</text>
            <text className="cf-z d2" x="480" y="104" fontSize="20">Z</text>
            <text className="cf-z d3" x="494" y="90" fontSize="14">z</text>

            <Spark x={200} y={150} s={1.1} />
            <Spark x={360} y={40} s={.8} cls="d2" />
            <Spark x={560} y={90} s={.9} cls="d3" />
            <Spark x={40} y={190} s={.7} cls="d2" />
            <Spark x={700} y={220} s={.8} />
        </svg>
    );
}

function EnvelopeArt() {
    return (
        <svg className="cf-env-art" viewBox="0 0 420 260" aria-hidden="true">
            <defs>
                <linearGradient id="cf-env-body" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f4c6ef" />
                    <stop offset="1" stopColor="#b88be0" />
                </linearGradient>
                <linearGradient id="cf-env-flap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#e9b3ec" />
                    <stop offset="1" stopColor="#c595e8" />
                </linearGradient>
                <linearGradient id="cf-env-card" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffe3f4" />
                    <stop offset="1" stopColor="#f6a8d6" />
                </linearGradient>
                <filter id="cf-env-glow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="6" />
                </filter>
            </defs>

            <ellipse cx="210" cy="238" rx="175" ry="20" fill="#7b4aa8" opacity=".55" />
            <ellipse cx="210" cy="120" rx="195" ry="52" fill="none" stroke="#ff9ccd" strokeOpacity=".45" transform="rotate(-14 210 120)" />
            <ellipse cx="210" cy="122" rx="165" ry="40" fill="none" stroke="#e7b6ff" strokeOpacity=".35" transform="rotate(10 210 122)" />

            <g transform="rotate(-3 205 130)">
                <path d="M110 104 L205 38 L300 104Z" fill="url(#cf-env-flap)" stroke="#fff" strokeOpacity=".4" strokeLinejoin="round" />
                <rect x="136" y="58" width="138" height="96" rx="8" fill="url(#cf-env-card)" stroke="#fff" strokeOpacity=".6" />
                <g transform="translate(205 100)">
                    <path className="cf-pulse" d={HEART} fill="#ff6fb5" filter="url(#cf-env-glow)" transform="scale(2.8)" />
                    <path d={HEART} fill="#ff8cc6" stroke="#fff" strokeOpacity=".85" transform="scale(2)" />
                </g>
                <polygon points="110,104 205,170 110,218" fill="#d6a4ec" stroke="#fff" strokeOpacity=".35" strokeLinejoin="round" />
                <polygon points="300,104 205,170 300,218" fill="#c795e6" stroke="#fff" strokeOpacity=".35" strokeLinejoin="round" />
                <polygon points="110,218 205,170 300,218" fill="url(#cf-env-body)" stroke="#fff" strokeOpacity=".45" strokeLinejoin="round" />
            </g>

            {/* leaves + flowers */}
            <ellipse cx="70" cy="214" rx="26" ry="8" fill="#6d4aa8" transform="rotate(-24 70 214)" />
            <ellipse cx="350" cy="222" rx="26" ry="8" fill="#6d4aa8" transform="rotate(20 350 222)" />
            <Flower x={62} y={186} r={22} />
            <Flower x={104} y={216} r={16} />
            <Flower x={28} y={216} r={13} petal="#c9a0f0" />
            <Flower x={332} y={196} r={18} />
            <Flower x={368} y={224} r={13} petal="#c9a0f0" />
            <Flower x={296} y={226} r={12} />

            <MiniHeart x={92} y={44} s={.6} />
            <MiniHeart x={150} y={24} s={.5} cls="d2" />
            <MiniHeart x={312} y={36} s={.6} cls="d3" />
            <MiniHeart x={352} y={78} s={.5} cls="d2" />
            <MiniHeart x={60} y={110} s={.45} cls="d3" />
            <Spark x={36} y={60} s={.8} />
            <Spark x={390} y={40} s={.9} cls="d2" />
            <Spark x={250} y={14} s={.6} cls="d3" />
            <Spark x={380} y={130} s={.6} />
        </svg>
    );
}

/* ---------- page ---------- */
export default function ComfortIndex() {
    const [message, setMessage] = useState<string | null>(null);
    const [empty, setEmpty] = useState(false);
    const [loading, setLoading] = useState(false);

    async function reveal() {
        setLoading(true);
        try {
            const res = await api<{ body: string | null }>(
                'GET',
                `/content/random/comfort${message ? `?exclude=${encodeURIComponent(message)}` : ''}`,
            );
            setEmpty(res.body === null);
            setMessage(res.body);
        } catch {
            setMessage(null);
        } finally {
            setLoading(false);
        }
    }

    const shown = message ?? (empty ? 'Nothing here yet.' : DEFAULT_QUOTE);

    return (
        <AppLayout title="Comfort corner">
            <div className="cf">
                {/* Hero */}
                <section className="cf-hero">
                    <div className="cf-hero-text">
                        <span className="cf-pill">
                            <Heart size={16} />
                            Comfort Corner
                        </span>
                        <h1 className="cf-title">
                            Comfort <span>Corner</span>
                            <Heart size={34} />
                        </h1>
                        <p className="cf-sub">For the days that feel heavy. Open it only when you want to.</p>
                        <div className="cf-slow">
                            Take a slow breath. You are doing better than you think.
                            <Heart size={15} />
                        </div>
                    </div>
                    <HeroArt />
                </section>

                {/* Deep breath */}
                <section className="cf-breath">
                    <EnvelopeArt />

                    <div>
                        <h2 className="cf-breath-title">
                            Take a deep breath...
                            <Heart size={22} />
                        </h2>
                        <p className="cf-breath-text">
                            For the days that feel heavy, remember: you&apos;re not alone.
                            <br />
                            You can always come back here, whenever you need a little comfort. <Heart size={15} />
                        </p>

                        <div className={`cf-quote ${message ? '' : 'is-empty'}`}>
                            <p key={shown}>
                                {message || !empty ? <>&ldquo;{shown}&rdquo;</> : shown}
                            </p>
                        </div>

                        <div className="cf-actions">
                            <button type="button" className="cf-read" onClick={reveal} disabled={loading}>
                                <Heart size={18} />
                                {message ? 'Read Another One' : 'Read a Comfort Message'}
                            </button>
                        </div>
                    </div>
                </section>

                <div className="cf-divider" aria-hidden="true">
                    <Heart size={22} />
                </div>

                {/* Other ways */}
                <section className="cf-more">
                    <div className="cf-more-head">
                        <h2>
                            <Sparkle size={20} />
                            Other Ways to Feel Better
                        </h2>
                        <Link href="/playroom">Explore more little comforts &rarr;</Link>
                    </div>

                    <div className="cf-tiles">
                        {COMFORTS.map((c) => (
                            <Link key={c.href} href={c.href} className="cf-tile">
                                <span className="cf-tile-icon">
                                    <c.icon size={34} />
                                </span>
                                <span className="cf-tile-text">
                                    <strong>{c.title}</strong>
                                    <small>{c.desc}</small>
                                </span>
                                <ChevronRight className="cf-tile-chev" size={20} />
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}