const rand = (seed: number) => {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return s / 2147483647;
    };
};

export const ANIM = [
    '@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important}}',
    // twinkle (groups of stars share a phase = cheap shimmer)
    '.tw{animation:tw 3.4s ease-in-out infinite}.tw2{animation-duration:4.6s;animation-delay:-1.3s}.tw3{animation-duration:2.7s;animation-delay:-2.1s}',
    '@keyframes tw{0%,100%{opacity:1}50%{opacity:.3}}',
    // glow pulse / flicker
    '.pu{animation:pu 3.6s ease-in-out infinite alternate}@keyframes pu{from{opacity:.5}to{opacity:1}}',
    '.fk{animation:fk 2.6s linear infinite}@keyframes fk{0%,100%{opacity:.92}15%{opacity:.7}30%{opacity:1}55%{opacity:.78}75%{opacity:.98}}',
    // drifting things
    '.dr{animation:dr 18s ease-in-out infinite alternate}@keyframes dr{to{transform:translateX(34px)}}',
    '.ms{animation:ms 40s ease-in-out infinite alternate}@keyframes ms{to{transform:translateX(150px)}}',
    '.fl{animation:fl 5s ease-in-out infinite alternate}@keyframes fl{to{transform:translateY(-16px)}}',
    '.wd{animation:wd 14s ease-in-out infinite}@keyframes wd{0%,100%{transform:translate(0,0)}33%{transform:translate(var(--dx,40px),var(--dy,-30px))}66%{transform:translate(calc(var(--dx,40px)*-.6),calc(var(--dy,-30px)*.4))}}',
    '.cx{animation:cx linear infinite}@keyframes cx{from{transform:translateX(-260px)}to{transform:translateX(1900px)}}',
    // falling / rising
    '.fall{transform-box:fill-box;transform-origin:center;animation:fall linear infinite}',
    '@keyframes fall{0%{opacity:0;transform:translate(0,0) rotate(0)}8%{opacity:.9}92%{opacity:.9}100%{opacity:0;transform:translate(var(--dx,-120px),1000px) rotate(var(--rot,360deg))}}',
    '.rise{animation:rise linear infinite}@keyframes rise{0%{opacity:0;transform:translate(0,0)}10%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translate(var(--dx,60px),-820px)}}',
    '.rain{animation:rain linear infinite}@keyframes rain{0%{opacity:0;transform:translate(0,0)}12%{opacity:.8}100%{opacity:0;transform:translate(-30px,430px)}}',
    // meteors
    '.mt{opacity:0;animation:mt linear infinite}@keyframes mt{0%{opacity:0;transform:translateX(0)}1.5%{opacity:1}9%{opacity:0;transform:translateX(var(--tr,520px))}100%{opacity:0;transform:translateX(var(--tr,520px))}}',
    // swaying (rotate from the base, skew for wide groups)
    '.sw{transform-box:fill-box;transform-origin:50% 100%;animation:sw 5s ease-in-out infinite alternate}',
    '@keyframes sw{from{transform:rotate(calc(var(--a,3deg)*-1))}to{transform:rotate(var(--a,3deg))}}',
    '.sk{transform-box:fill-box;transform-origin:50% 100%;animation:sk 4.4s ease-in-out infinite alternate}',
    '@keyframes sk{from{transform:skewX(calc(var(--a,2deg)*-1))}to{transform:skewX(var(--a,2deg))}}',
    '.cs{transform-box:fill-box;transform-origin:50% 0;animation:cs 6s ease-in-out infinite alternate}@keyframes cs{from{transform:skewX(-1.5deg)}to{transform:skewX(1.5deg)}}',
    // water
    '.wv{animation:wv linear infinite}@keyframes wv{to{transform:translateX(calc(var(--p)*-1))}}.rev{animation-direction:reverse}',
    '.sh{transform-box:fill-box;transform-origin:center;animation:sh 3.2s ease-in-out infinite}@keyframes sh{0%,100%{transform:scaleX(1);opacity:.6}50%{transform:scaleX(.55);opacity:1}}',
    '.rp{transform-box:fill-box;transform-origin:center;opacity:0;animation:rp 7s ease-out infinite}@keyframes rp{0%{opacity:.75;transform:scale(.15)}100%{opacity:0;transform:scale(1.7)}}',
    '.bob{transform-box:fill-box;transform-origin:50% 85%;animation:bob 5.5s ease-in-out infinite}@keyframes bob{0%,100%{transform:translateY(0) rotate(-1.4deg)}50%{transform:translateY(6px) rotate(1.4deg)}}',
    // creatures
    '.br{transform-box:fill-box;transform-origin:50% 100%;animation:br 4.6s ease-in-out infinite}@keyframes br{0%,100%{transform:scale(1,1)}50%{transform:scale(1.015,1.05)}}',
    '.tail{transform-box:fill-box;transform-origin:0 0;animation:tail 3.8s ease-in-out infinite alternate}@keyframes tail{from{transform:rotate(-4deg)}to{transform:rotate(7deg)}}',
    '.zz{transform-box:fill-box;transform-origin:center;opacity:0;animation:zz 5s ease-out infinite}@keyframes zz{0%{opacity:0;transform:translate(0,0) scale(.6)}25%{opacity:.9}100%{opacity:0;transform:translate(22px,-54px) scale(1.2)}}',
    '.st{transform-box:fill-box;transform-origin:50% 100%;opacity:0;animation:st 3.6s ease-out infinite}@keyframes st{0%{opacity:0;transform:translateY(0) scaleY(.6)}30%{opacity:.7}100%{opacity:0;transform:translateY(-34px) scaleY(1.2)}}',
    '.wl{transform-box:fill-box;transform-origin:100% 50%;animation:wf .45s ease-in-out infinite alternate}.wr{transform-box:fill-box;transform-origin:0 50%;animation:wf .45s ease-in-out infinite alternate}@keyframes wf{to{transform:scaleX(.35)}}',
    '.spin{transform-box:fill-box;transform-origin:center;animation:spin 60s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}',
].join('');

/** Shooting star. Travels along its own axis; invisible between passes. */
export const meteor = (x: number, y: number, len: number, angle: number, delay: number, dur: number, travel = 560) =>
    `<g transform="translate(${x} ${y}) rotate(${angle})"><g class="mt" style="--tr:${travel}px;animation-duration:${dur}s;animation-delay:${delay}s"><rect x="${-len}" y="-1.5" width="${len}" height="3" rx="1.5" fill="url(#mtg)"/><circle r="12" fill="#fff" opacity=".22"/><circle r="4.5" fill="#fff"/></g></g>`;

/** Rolling water lines. Each path is one wave period wide, so the loop is seamless. */
export function waves(y0: number, y1: number, n: number, color = '#cfc2ff') {
    let o = '';
    for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : i / (n - 1);
        const y = y0 + (y1 - y0) * Math.pow(t, 1.35);
        const amp = 2.5 + t * 13;
        const P = Math.round(170 + t * 330);
        const dur = (18 - t * 9).toFixed(1);
        const w = (1.4 + t * 3.2).toFixed(1);
        const op = (0.1 + t * 0.2).toFixed(2);
        const x0 = -P;
        let d = `M${x0} ${y.toFixed(1)} Q${x0 + P / 4} ${(y - amp).toFixed(1)} ${x0 + P / 2} ${y.toFixed(1)}`;
        for (let x = x0 + P; x <= 1600 + 2 * P; x += P / 2) d += ` T${x} ${y.toFixed(1)}`;
        o += `<path class="wv${i % 2 ? ' rev' : ''}" style="--p:${P}px;animation-duration:${dur}s" d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;
    }
    return o;
}

/** Three expanding rings on the water. */
export const ripple = (cx: number, cy: number, rx: number, delay = 0, dur = 7) =>
    [0, 1, 2]
        .map(
            (i) =>
                `<ellipse class="rp" style="animation-duration:${dur}s;animation-delay:${(delay + (i * dur) / 3).toFixed(1)}s" cx="${cx}" cy="${cy}" rx="${rx}" ry="${(rx * 0.2).toFixed(0)}" fill="none" stroke="#fff" stroke-width="2"/>`,
        )
        .join('');

/** Tiny light glints that blink on the water. */
export function glints(seed: number, n: number, y0: number, y1: number, color = '#fff') {
    const r = rand(seed);
    const g = ['', '', ''];
    for (let i = 0; i < n; i++) {
        const y = y0 + Math.pow(r(), 1.2) * (y1 - y0);
        const rx = 5 + ((y - y0) / (y1 - y0)) * 14 + r() * 6;
        g[i % 3] += `<ellipse cx="${(r() * 1600).toFixed(0)}" cy="${y.toFixed(0)}" rx="${rx.toFixed(0)}" ry="1.6" fill="${color}" opacity=".55"/>`;
    }
    return `<g class="tw">${g[0]}</g><g class="tw tw2">${g[1]}</g><g class="tw tw3">${g[2]}</g>`;
}

/** Glowing dots that wander and pulse. */
export function fireflies(seed: number, n: number, y0: number, y1: number, color = '#fff3a8') {
    const r = rand(seed);
    let o = '';
    for (let i = 0; i < n; i++) {
        const x = (r() * 1600).toFixed(0);
        const y = (y0 + r() * (y1 - y0)).toFixed(0);
        const dx = Math.round((r() - 0.5) * 160);
        const dy = Math.round((r() - 0.7) * 110);
        o += `<g class="wd" style="--dx:${dx}px;--dy:${dy}px;animation-duration:${(10 + r() * 10).toFixed(1)}s;animation-delay:-${(r() * 12).toFixed(1)}s"><g class="pu" style="animation-duration:${(1.8 + r() * 2.4).toFixed(1)}s;animation-delay:-${(r() * 3).toFixed(1)}s"><circle cx="${x}" cy="${y}" r="11" fill="${color}" opacity=".22"/><circle cx="${x}" cy="${y}" r="3" fill="${color}"/></g></g>`;
    }
    return o;
}

/** A bird / bat flapping across the whole sky. */
export const birdFly = (y: number, s: number, dur: number, delay: number, color = '#1b1458') =>
    `<g class="cx" style="animation-duration:${dur}s;animation-delay:-${delay}s"><g transform="translate(0 ${y}) scale(${s})"><path d="M0 0 Q10 -12 20 0 Q30 -12 40 0" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"><animate attributeName="d" dur="${(0.8 + (y % 5) * 0.08).toFixed(2)}s" repeatCount="indefinite" values="M0 0 Q10 -12 20 0 Q30 -12 40 0;M0 0 Q10 7 20 0 Q30 7 40 0;M0 0 Q10 -12 20 0 Q30 -12 40 0"/></path></g></g>`;

/** Butterfly: wings flap, body wanders. */
export const butterfly = (x: number, y: number, s: number, c: string, delay = 0, dx = 120, dy = -60) =>
    `<g class="wd" style="--dx:${dx}px;--dy:${dy}px;animation-duration:${18 + delay * 2}s;animation-delay:-${delay * 3}s"><g transform="translate(${x} ${y}) scale(${s})"><circle r="28" fill="${c}" opacity=".22"/>` +
    `<g class="wl"><ellipse cx="-9" cy="-4" rx="10" ry="15" transform="rotate(-25 -9 -4)" fill="${c}"/><ellipse cx="-6" cy="9" rx="6" ry="8" fill="${c}" opacity=".85"/></g>` +
    `<g class="wr"><ellipse cx="9" cy="-4" rx="10" ry="15" transform="rotate(25 9 -4)" fill="${c}"/><ellipse cx="6" cy="9" rx="6" ry="8" fill="${c}" opacity=".85"/></g>` +
    `<rect x="-1" y="-9" width="2" height="22" rx="1" fill="#fff" opacity=".7"/></g></g>`;

/** Floating "z z z" for sleepers. */
export const zzz = (x: number, y: number, s = 1) =>
    [0, 1, 2]
        .map(
            (i) =>
                `<g transform="translate(${x + i * 14 * s} ${y - i * 18 * s}) scale(${(s * (0.7 + i * 0.25)).toFixed(2)})"><path class="zz" style="animation-delay:${(i * 1.6).toFixed(1)}s" d="M0 0 H12 L0 14 H12" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`,
        )
        .join('');

/** Steam wisps rising from a cup. */
export const steam = (x: number, y: number) =>
    [0, 1, 2]
        .map(
            (i) =>
                `<g transform="translate(${x + (i - 1) * 9} ${y})"><path class="st" style="animation-delay:${(i * 1.1).toFixed(1)}s" d="M0 0 Q-6 -10 0 -20 Q6 -30 0 -40" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g>`,
        )
        .join('');

/** Petals drifting down the whole screen (spread out with negative delays). */
export function petalsFall(seed: number, n: number) {
    const r = rand(seed);
    const cols = ['#ffc2e2', '#ffb0d8', '#ffd6ec'];
    let o = '';
    for (let i = 0; i < n; i++) {
        const x = (r() * 1700 - 50).toFixed(0);
        o += `<g class="fall" style="--dx:${-Math.round(80 + r() * 200)}px;--rot:${Math.round(180 + r() * 540)}deg;animation-duration:${(10 + r() * 9).toFixed(1)}s;animation-delay:-${(r() * 18).toFixed(1)}s"><ellipse cx="${x}" cy="-30" rx="7.5" ry="4.2" transform="rotate(${Math.round(r() * 180)} ${x} -30)" fill="${cols[i % 3]}"/></g>`;
    }
    return o;
}

/** Glowing paper lanterns floating up. */
export function skyLanterns(seed: number, n: number) {
    const r = rand(seed);
    let o = '';
    for (let i = 0; i < n; i++) {
        const x = Math.round(120 + r() * 1360);
        const s = (0.6 + r() * 0.7).toFixed(2);
        o += `<g class="rise" style="--dx:${Math.round((r() - 0.5) * 160)}px;animation-duration:${(26 + r() * 18).toFixed(1)}s;animation-delay:-${(r() * 40).toFixed(1)}s"><g transform="translate(${x} 900) scale(${s})"><circle r="46" fill="#ffb870" opacity=".16"/><circle r="26" fill="#ffc98a" opacity=".28"/><path d="M-13 -18 L13 -18 L17 20 L-17 20Z" fill="#ffd9a0"/><ellipse cx="0" cy="-18" rx="13" ry="4" fill="#ffe9bf"/><path d="M-6 6 Q0 -6 6 6Z" fill="#ff9a4a"/></g></g>`;
    }
    return o;
}

/** Swaying reeds / cattails along a shore. */
export function reeds(x0: number, x1: number, base: number, n: number, seed: number, color: string) {
    const r = rand(seed);
    let o = '';
    for (let i = 0; i < n; i++) {
        const x = x0 + r() * (x1 - x0);
        const h = 70 + r() * 90;
        const lean = (r() - 0.5) * 36;
        const tail = r() > 0.55 ? `<ellipse cx="${(lean * 1.6).toFixed(0)}" cy="${(-h - 9).toFixed(0)}" rx="4.5" ry="14" fill="${color}"/>` : '';
        o += `<g transform="translate(${x.toFixed(0)} ${base})"><g class="sw" style="--a:${(2 + r() * 2.5).toFixed(1)}deg;animation-duration:${(3.6 + r() * 2.6).toFixed(1)}s;animation-delay:-${(r() * 4).toFixed(1)}s"><path d="M0 0 Q${lean.toFixed(0)} ${(-h * 0.55).toFixed(0)} ${(lean * 1.6).toFixed(0)} ${(-h).toFixed(0)}" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round"/>${tail}</g></g>`;
    }
    return o;
}

/** Soft layered mist that drifts sideways. */
export const mist = (cx: number, cy: number, rx: number, ry: number, color: string, op: number, dur: number, delay = 0) =>
    `<g class="ms" style="animation-duration:${dur}s;animation-delay:-${delay}s">${[1, 0.72, 0.46]
        .map((k, i) => `<ellipse cx="${cx}" cy="${cy}" rx="${(rx * k).toFixed(0)}" ry="${(ry * k).toFixed(0)}" fill="${color}" opacity="${(op * (0.45 + i * 0.25)).toFixed(2)}"/>`)
        .join('')}</g>`;

/** Rain streaks (clip them to a window yourself). */
export function rain(seed: number, n: number, x0: number, x1: number, y: number) {
    const r = rand(seed);
    let o = '';
    for (let i = 0; i < n; i++) {
        const x = x0 + r() * (x1 - x0);
        o += `<g class="rain" style="animation-duration:${(0.8 + r() * 0.8).toFixed(2)}s;animation-delay:-${(r() * 2).toFixed(2)}s"><line x1="${x.toFixed(0)}" y1="${y}" x2="${(x - 3).toFixed(0)}" y2="${y + Math.round(22 + r() * 14)}" stroke="#d7dcff" stroke-width="1.5" stroke-linecap="round" opacity=".75"/></g>`;
    }
    return o;
}