import { ANIM, zzz } from './motion';

export const rng = (seed: number) => {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return s / 2147483647;
    };
};

export const lin = (id: string, stops: [number, string][]) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;

export const radial = (id: string, color: string, o = 0.5) =>
    `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${o}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;

export const svgOf = (defs: string, body: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><style>${ANIM}</style><linearGradient id="mtg"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>${defs}</defs>${body}</svg>`;

export const starPath = (r: number, ir: number) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rad = i % 2 ? ir : r;
        return `${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`;
    });
    return `M${pts.join('L')}Z`;
};

/** Stars in 4 groups; 3 of them twinkle out of phase (cheap, but looks alive). */
export function stars(seed: number, n: number, yMax = 560) {
    const r = rng(seed);
    const g = ['', '', '', ''];
    for (let i = 0; i < n; i++) {
        g[i % 4] += `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(r() * yMax).toFixed(0)}" r="${(r() * 1.6 + 0.5).toFixed(1)}" fill="#fff" opacity="${(0.35 + r() * 0.65).toFixed(2)}"/>`;
    }
    return `<g>${g[0]}</g><g class="tw">${g[1]}</g><g class="tw tw2">${g[2]}</g><g class="tw tw3">${g[3]}</g>`;
}

export const sparkle = (x: number, y: number, r: number, fill = '#fff', delay = 0) => {
    const k = r * 0.15;
    return `<path class="tw" style="animation-delay:-${delay}s" transform="translate(${x} ${y})" d="M0 ${-r} Q${k} ${-k} ${r} 0 Q${k} ${k} 0 ${r} Q${-k} ${k} ${-r} 0 Q${-k} ${-k} 0 ${-r}Z" fill="${fill}"/>`;
};

export const goldStar = (x: number, y: number, r: number, delay = 0) =>
    `<path class="tw" style="animation-delay:-${delay}s" transform="translate(${x} ${y}) rotate(-10)" d="${starPath(r, r * 0.48)}" fill="#ffc86b" stroke="#ffc86b" stroke-width="${(r * 0.24).toFixed(1)}" stroke-linejoin="round"/>`;

export const cloud = (x: number, y: number, s: number, fill: string, op = 1) => {
    const k = Math.abs(Math.round(x)) % 9;
    return `<g class="dr" style="animation-duration:${14 + k * 2}s;animation-delay:-${k}s"><g transform="translate(${x} ${y}) scale(${s})" fill="${fill}" opacity="${op}"><ellipse cx="0" cy="44" rx="170" ry="40"/><circle cx="-80" cy="22" r="46"/><circle cx="-10" cy="-4" r="64"/><circle cx="76" cy="20" r="50"/></g></g>`;
};

export const moon = (x: number, y: number, r: number) =>
    `<defs><radialGradient id="mg"><stop offset="0" stop-color="#ffe9b0" stop-opacity=".5"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></radialGradient><mask id="mc"><rect width="1600" height="900" fill="#fff"/><circle cx="${x + r * 0.5}" cy="${y - r * 0.15}" r="${r * 0.88}" fill="#000"/></mask></defs><g class="pu" style="animation-duration:6s"><circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="url(#mg)"/></g><circle cx="${x}" cy="${y}" r="${r}" fill="#ffe9b0" mask="url(#mc)"/>`;

export const fullMoon = (x: number, y: number, r: number) =>
    `<defs><radialGradient id="mg"><stop offset="0" stop-color="#fff3c8" stop-opacity=".55"/><stop offset="1" stop-color="#fff3c8" stop-opacity="0"/></radialGradient></defs><g class="pu" style="animation-duration:6s"><circle cx="${x}" cy="${y}" r="${r * 3}" fill="url(#mg)"/></g><circle cx="${x}" cy="${y}" r="${r}" fill="#fff6d6"/>`;

export const shoot = (id: string, x1: number, y1: number, x2: number, y2: number) =>
    `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".95"/></linearGradient></defs><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#${id})" stroke-width="3" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="18" fill="#fff" opacity=".25"/><circle cx="${x2}" cy="${y2}" r="5" fill="#fff"/>`;

export const plant = (x: number, y: number, s: number) =>
    `<g class="sw" style="animation-delay:-${(x % 5).toFixed(1)}s"><g transform="translate(${x} ${y}) scale(${s})" fill="#2a1448"><rect x="-3" y="-120" width="6" height="120"/><ellipse cx="-22" cy="-90" rx="22" ry="9" transform="rotate(-35 -22 -90)"/><ellipse cx="22" cy="-70" rx="22" ry="9" transform="rotate(35 22 -70)"/><ellipse cx="-24" cy="-48" rx="22" ry="9" transform="rotate(-30 -24 -48)"/><ellipse cx="0" cy="-128" rx="10" ry="20"/></g></g>`;

export const pine = (x: number, y: number, s: number, fill: string, sway = true) => {
    const tree = `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}"><path d="M0 -150 L36 -80 L18 -80 L50 -20 L24 -20 L60 50 L-60 50 L-24 -20 L-50 -20 L-18 -80 L-36 -80Z"/><rect x="-6" y="50" width="12" height="30"/></g>`;
    return sway ? `<g class="sw" style="--a:1.2deg;animation-duration:${(6 + (x % 4)).toFixed(0)}s;animation-delay:-${(x % 5).toFixed(0)}s">${tree}</g>` : tree;
};

/** Grass blades in 3 groups that lean in the wind. */
export function grass(seed: number, n: number, base: number, h: number, fill: string) {
    const r = rng(seed);
    const g = ['', '', ''];
    for (let i = 0; i < n; i++) {
        const x = r() * 1600;
        const hh = h * (0.5 + r() * 0.8);
        const lean = (r() - 0.5) * 40;
        g[i % 3] += `<path d="M${x.toFixed(0)} ${base} Q${(x + lean / 2).toFixed(0)} ${(base - hh * 0.6).toFixed(0)} ${(x + lean).toFixed(0)} ${(base - hh).toFixed(0)}" stroke="${fill}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
    return g.map((b, i) => `<g class="sk" style="--a:${3 + i}deg;animation-duration:${(3.4 + i * 0.7).toFixed(1)}s;animation-delay:-${(i * 1.3).toFixed(1)}s">${b}</g>`).join('');
}

export function blossoms(cx: number, cy: number, spread: number, n: number, seed: number) {
    const r = rng(seed);
    const cols = ['#ff9fd2', '#ffb8de', '#f27cbc', '#ffd3ea'];
    let o = '';
    for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r()) * spread;
        o += `<circle cx="${(cx + Math.cos(a) * d * 1.3).toFixed(0)}" cy="${(cy + Math.sin(a) * d * 0.8).toFixed(0)}" r="${(18 + r() * 24).toFixed(0)}" fill="${cols[i % 4]}" opacity=".88"/>`;
    }
    return o;
}

/** Sleeping cat: breathes, tail swishes, little z's float up. */
export const sleepingCat = (x: number, y: number, s: number) =>
    `<g class="br"><g transform="translate(${x} ${y}) scale(${s})" stroke="#e0a9d8" stroke-opacity=".6">` +
    `<g class="tail"><path d="M62 -10 Q116 -12 110 26 Q104 42 78 32" fill="none" stroke="#f3c1e4" stroke-opacity="1" stroke-width="14" stroke-linecap="round"/></g>` +
    `<ellipse cx="0" cy="0" rx="92" ry="40" fill="#fbe6f6"/>` +
    `<ellipse cx="22" cy="-12" rx="18" ry="11" fill="#e9a9d4" stroke="none" opacity=".6"/><ellipse cx="60" cy="8" rx="14" ry="9" fill="#e9a9d4" stroke="none" opacity=".55"/>` +
    `<circle cx="-56" cy="-26" r="40" fill="#fbe6f6"/>` +
    `<path d="M-85 -50 L-83 -82 L-59 -60Z" fill="#fbe6f6" stroke-linejoin="round"/><path d="M-50 -62 L-26 -82 L-24 -48Z" fill="#fbe6f6" stroke-linejoin="round"/>` +
    `<path d="M-80 -54 L-78 -70 L-66 -60Z" fill="#f7a8cf" stroke="none" opacity=".8"/><path d="M-42 -60 L-30 -70 L-29 -52Z" fill="#f7a8cf" stroke="none" opacity=".8"/>` +
    `<path d="M-73 -24 Q-66 -17 -59 -24 M-49 -24 Q-42 -17 -35 -24" fill="none" stroke="#7a4a8a" stroke-opacity="1" stroke-width="2.4" stroke-linecap="round"/>` +
    `<path d="M-59 -15 L-51 -15 L-55 -10Z" fill="#f08fb8" stroke="none"/>` +
    `<ellipse cx="-78" cy="-13" rx="7" ry="4.5" fill="#ff9fcf" stroke="none" opacity=".6"/><ellipse cx="-32" cy="-13" rx="7" ry="4.5" fill="#ff9fcf" stroke="none" opacity=".6"/>` +
    `<ellipse cx="-34" cy="16" rx="16" ry="9" fill="#fbe6f6"/></g></g>` +
    zzz(x - 10 * s, y - 100 * s, s * 0.9);