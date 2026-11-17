import '../../../css/login.css';
import { Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import GuestLayout from '../../layouts/guest-layout';
import LoginScene from '../../components/login-scene';

type Focus = 'none' | 'email' | 'password';

type PalProps = {
    body: string;
    hand: string;
    covered: boolean;
    peeking: boolean;
    worried: boolean;
    variant: 'a' | 'b';
    svgRef: (el: SVGSVGElement | null) => void;
};

function Pal({ body, hand, covered, peeking, worried, variant, svgRef }: PalProps) {
    /* the second pal keeps one hand down so it can peek */
    const rightDown = variant === 'b' && peeking;
    const leftUp = covered || peeking;
    const rightUp = covered && !rightDown;

    return (
        <svg ref={svgRef} className={`lg-pal lg-pal-${variant}`} viewBox="0 0 120 96" aria-hidden="true">
            <path d="M8 96 V52 C8 22 30 6 60 6 C90 6 112 22 112 52 V96 Z" fill={body} />
            <circle cx="26" cy="62" r="6" fill="#ff8fb8" opacity="0.45" />
            <circle cx="94" cy="62" r="6" fill="#ff8fb8" opacity="0.45" />

            <g className="lg-eye">
                <circle cx="44" cy="46" r="11" fill="#fff" />
                <g className="lg-pupil">
                    <circle cx="44" cy="46" r="5.5" fill="#2a1f33" />
                    <circle cx="46" cy="44" r="1.8" fill="#fff" />
                </g>
            </g>
            <g className="lg-eye">
                <circle cx="76" cy="46" r="11" fill="#fff" />
                <g className="lg-pupil">
                    <circle cx="76" cy="46" r="5.5" fill="#2a1f33" />
                    <circle cx="78" cy="44" r="1.8" fill="#fff" />
                </g>
            </g>

            {worried ? (
                <path d="M52 73 Q60 65 68 73" fill="none" stroke="#2a1f33" strokeWidth="2.5" strokeLinecap="round" />
            ) : (
                <path d="M52 66 Q60 75 68 66" fill="none" stroke="#2a1f33" strokeWidth="2.5" strokeLinecap="round" />
            )}

            <g className={`lg-hand lg-hand-l${leftUp ? ' up' : ''}`}>
                <circle cx="34" cy="122" r="16" fill={hand} />
            </g>
            <g className={`lg-hand lg-hand-r${rightUp ? ' up' : ''}`}>
                <circle cx="86" cy="122" r="16" fill={hand} />
            </g>
        </svg>
    );
}

export default function Login() {
    const form = useForm({ email: '', password: '' });
    const [focus, setFocus] = useState<Focus>('none');
    const [show, setShow] = useState(false);
    const [shake, setShake] = useState(false);

    const pals = useRef<(SVGSVGElement | null)[]>([null, null]);
    const focusRef = useRef<Focus>('none');
    focusRef.current = focus;

    const hasError = Boolean(form.errors.email || form.errors.password);
    const pwFocused = focus === 'password';
    const covered = pwFocused && !show;
    const peeking = pwFocused && show;

    const aim = (el: SVGSVGElement | null, x: number, y: number) => {
        if (!el) return;
        el.style.setProperty('--px', `${x.toFixed(2)}px`);
        el.style.setProperty('--py', `${y.toFixed(2)}px`);
    };

    /* eyes follow the pointer while no field is focused */
    useEffect(() => {
        const move = (e: PointerEvent) => {
            if (focusRef.current !== 'none') return;
            pals.current.forEach((el) => {
                if (!el) return;
                const r = el.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                const dist = Math.hypot(dx, dy) || 1;
                const power = Math.min(dist / 180, 1) * 4.5;
                aim(el, (dx / dist) * power, (dy / dist) * power);
            });
        };
        window.addEventListener('pointermove', move);
        return () => window.removeEventListener('pointermove', move);
    }, []);

    /* eyes follow the typing, or look away while the password is peeked at */
    useEffect(() => {
        if (focus === 'email') {
            const ratio = Math.max(-1, Math.min(1, (form.data.email.length / 24 - 0.5) * 2));
            aim(pals.current[0], ratio * 4, 3.5);
            aim(pals.current[1], ratio * 4, 3.5);
        } else if (focus === 'password') {
            aim(pals.current[0], -3, 4);
            aim(pals.current[1], -3.5, 4);
        } else {
            aim(pals.current[0], 0, 0);
            aim(pals.current[1], 0, 0);
        }
    }, [focus, form.data.email, show]);

    /* shake the card when the login fails */
    useEffect(() => {
        if (!hasError) return;
        setShake(true);
        const t = window.setTimeout(() => setShake(false), 550);
        return () => window.clearTimeout(t);
    }, [form.errors.email, form.errors.password]);

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/login', { onFinish: () => form.reset('password') });
    }

    return (
        <GuestLayout title="Log in">
            <LoginScene />
            <form className={`lg-card${shake ? ' shake' : ''}`} onSubmit={submit} noValidate>
                <div className={`lg-pals${form.processing ? ' busy' : ''}`}>
                    <Pal
                        variant="a"
                        body="#f78fc0"
                        hand="#e872ab"
                        covered={covered}
                        peeking={peeking}
                        worried={hasError}
                        svgRef={(el) => (pals.current[0] = el)}
                    />
                    <Pal
                        variant="b"
                        body="#a78bfa"
                        hand="#8f72f0"
                        covered={covered}
                        peeking={peeking}
                        worried={hasError}
                        svgRef={(el) => (pals.current[1] = el)}
                    />
                </div>

                <div className="lg-body">
                    <h2 className="lg-title">
                        Welcome back, <span>love</span> ♡
                    </h2>
                    <p className="lg-sub">Log in to our little universe.</p>

                    <label className={`lg-field${form.errors.email ? ' has-error' : ''}`}>
                        <span className="lg-label">Email</span>
                        <span className="lg-input">
                            <Mail size={18} />
                            <input
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                onFocus={() => setFocus('email')}
                                onBlur={() => setFocus('none')}
                                autoComplete="username"
                                placeholder="you@example.com"
                                autoFocus
                            />
                        </span>
                        {form.errors.email && <small className="lg-err">{form.errors.email}</small>}
                    </label>

                    <label className={`lg-field${form.errors.password ? ' has-error' : ''}`}>
                        <span className="lg-label">Password</span>
                        <span className="lg-input">
                            <Lock size={18} />
                            <input
                                type={show ? 'text' : 'password'}
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                onFocus={() => setFocus('password')}
                                onBlur={() => setFocus('none')}
                                autoComplete="current-password"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="lg-eye-btn"
                                aria-label={show ? 'Hide password' : 'Show password'}
                                aria-pressed={show}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShow((v) => !v)}
                            >
                                {show ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </span>
                        {form.errors.password && <small className="lg-err">{form.errors.password}</small>}
                    </label>

                    <button className="lg-submit" type="submit" disabled={form.processing}>
                        <span>{form.processing ? 'Opening the door…' : 'Log in'}</span>
                        <i aria-hidden="true">{form.processing ? '✨' : '→'}</i>
                    </button>

                    <Link href="/" className="lg-back">
                        ← Back to our universe
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}