import '../../../css/backgrounds.css';
import { router, useForm } from '@inertiajs/react';
import { Check, Eye, Heart, Image as ImageIcon, Loader2, RotateCcw, Sparkle, Trash2, Upload, UploadCloud, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';

type BackgroundRow = { id: number; is_active: boolean; is_mine: boolean; added_by: string };
type Cat = 'dreamy' | 'nature' | 'others';
type Tab = 'all' | Cat | 'fav';
type Preset = { key: string; name: string; cat: Cat; draw: () => string };
type Item = {
    key: string;
    kind: 'preset' | 'upload';
    name: string;
    src: string;
    active: boolean;
    cat?: Cat;
    id?: number;
    mine?: boolean;
    preset?: Preset;
};

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/* ============================================================
   Built-in scenes (drawn as SVG, uploaded once when picked)
   ============================================================ */
const rng = (seed: number) => {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return s / 2147483647;
    };
};

const lin = (id: string, stops: [number, string][]) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;

const svgOf = (defs: string, body: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>`;

function stars(seed: number, n: number, yMax = 560) {
    const r = rng(seed);
    let o = '';
    for (let i = 0; i < n; i++) {
        o += `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(r() * yMax).toFixed(0)}" r="${(r() * 1.6 + 0.5).toFixed(1)}" fill="#fff" opacity="${(0.35 + r() * 0.65).toFixed(2)}"/>`;
    }
    return o;
}

const cloud = (x: number, y: number, s: number, fill: string, op = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}" opacity="${op}"><ellipse cx="0" cy="44" rx="170" ry="40"/><circle cx="-80" cy="22" r="46"/><circle cx="-10" cy="-4" r="64"/><circle cx="76" cy="20" r="50"/></g>`;

const moon = (x: number, y: number, r: number) =>
    `<defs><radialGradient id="mg"><stop offset="0" stop-color="#ffe9b0" stop-opacity=".5"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></radialGradient><mask id="mc"><rect width="1600" height="900" fill="#fff"/><circle cx="${x + r * 0.5}" cy="${y - r * 0.15}" r="${r * 0.88}" fill="#000"/></mask></defs><circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="url(#mg)"/><circle cx="${x}" cy="${y}" r="${r}" fill="#ffe9b0" mask="url(#mc)"/>`;

const fullMoon = (x: number, y: number, r: number) =>
    `<defs><radialGradient id="mg"><stop offset="0" stop-color="#fff3c8" stop-opacity=".55"/><stop offset="1" stop-color="#fff3c8" stop-opacity="0"/></radialGradient></defs><circle cx="${x}" cy="${y}" r="${r * 3}" fill="url(#mg)"/><circle cx="${x}" cy="${y}" r="${r}" fill="#fff6d6"/>`;

const shoot = (id: string, x1: number, y1: number, x2: number, y2: number) =>
    `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".95"/></linearGradient></defs><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#${id})" stroke-width="3" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="18" fill="#fff" opacity=".25"/><circle cx="${x2}" cy="${y2}" r="5" fill="#fff"/>`;

const plant = (x: number, y: number, s: number) =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="#2a1448"><rect x="-3" y="-120" width="6" height="120"/><ellipse cx="-22" cy="-90" rx="22" ry="9" transform="rotate(-35 -22 -90)"/><ellipse cx="22" cy="-70" rx="22" ry="9" transform="rotate(35 22 -70)"/><ellipse cx="-24" cy="-48" rx="22" ry="9" transform="rotate(-30 -24 -48)"/><ellipse cx="0" cy="-128" rx="10" ry="20"/></g>`;

function blossoms(cx: number, cy: number, spread: number, n: number, seed: number) {
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

function petals(seed: number, n: number) {
    const r = rng(seed);
    let o = '';
    for (let i = 0; i < n; i++) {
        o += `<ellipse cx="${(r() * 1600).toFixed(0)}" cy="${(r() * 900).toFixed(0)}" rx="7" ry="4" transform="rotate(${(r() * 180).toFixed(0)})" fill="#ffc2e2" opacity=".8"/>`;
    }
    return o;
}

function flowers() {
    const r = rng(7);
    const ys = Array.from({ length: 64 }, () => 620 + r() * 260).sort((a, b) => a - b);
    const cols = ['#ff8fc7', '#ffb3dc', '#d98cff', '#ff7fb5'];
    let o = '';
    ys.forEach((y, i) => {
        const x = r() * 1600;
        const s = 10 + ((y - 600) / 300) * 26;
        const petalsSvg = [0, 72, 144, 216, 288]
            .map((a) => `<ellipse cx="0" cy="${(-s * 0.7).toFixed(1)}" rx="${(s * 0.38).toFixed(1)}" ry="${(s * 0.62).toFixed(1)}" transform="rotate(${a})" fill="${cols[i % 4]}"/>`)
            .join('');
        o += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><path d="M0 0 L0 ${(s * 2.2).toFixed(0)}" stroke="#4a2f7a" stroke-width="${(s / 6 + 1).toFixed(1)}"/>${petalsSvg}<circle r="${(s * 0.28).toFixed(1)}" fill="#ffe08a"/></g>`;
    });
    return o;
}

function city() {
    const r = rng(21);
    let o = '';
    for (let i = 0; i < 16; i++) {
        const h = 90 + r() * 170;
        const x = 480 + i * 42;
        o += `<rect x="${x}" y="${(540 - h).toFixed(0)}" width="34" height="${h.toFixed(0)}" fill="#2c1a55"/>`;
        for (let j = 0; j < 5; j++) {
            if (r() > 0.45) o += `<rect x="${x + 7}" y="${(540 - h + 14 + j * 24).toFixed(0)}" width="6" height="9" fill="#ffe08a" opacity=".85"/>`;
        }
    }
    return o;
}

const PRESETS: Preset[] = [
    {
        key: 'starry',
        name: 'Starry Dream',
        cat: 'dreamy',
        draw: () =>
            svgOf(
                lin('s', [[0, '#1a1244'], [0.55, '#4b2d8c'], [1, '#b86bc4']]),
                `<rect width="1600" height="900" fill="url(#s)"/>${stars(11, 170)}${moon(1180, 230, 70)}${shoot('t1', 420, 430, 900, 150)}${cloud(200, 790, 2.4, '#e58fd6', 0.9)}${cloud(620, 840, 3, '#c978d8', 0.95)}${cloud(1100, 800, 2.6, '#f2a6e0', 0.9)}${cloud(1500, 850, 2.4, '#b66bd0')}${cloud(-20, 860, 2.6, '#b06ccc')}`,
            ),
    },
    {
        key: 'sunset',
        name: 'Pink Sunset',
        cat: 'dreamy',
        draw: () =>
            svgOf(
                lin('s', [[0, '#2c2468'], [0.4, '#8f4fa8'], [0.7, '#ff7fa0'], [1, '#ffc58a']]) +
                    '<radialGradient id="sun"><stop offset="0" stop-color="#ffe3a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffe3a0" stop-opacity="0"/></radialGradient>',
                `<rect width="1600" height="900" fill="url(#s)"/>${stars(5, 60, 300)}<circle cx="800" cy="690" r="300" fill="url(#sun)"/>` +
                    `<ellipse cx="400" cy="470" rx="320" ry="22" fill="#ff9fb5" opacity=".5"/><ellipse cx="1150" cy="520" rx="380" ry="26" fill="#ffb3b0" opacity=".5"/><ellipse cx="780" cy="400" rx="420" ry="18" fill="#d77fc8" opacity=".45"/>` +
                    `${cloud(300, 330, 1.6, '#c779c9', 0.7)}${cloud(1250, 280, 1.8, '#d98cd0', 0.7)}` +
                    `<path d="M0 900 L0 790 Q400 740 800 800 T1600 770 L1600 900Z" fill="#2a1448"/>${plant(120, 820, 1.6)}${plant(300, 830, 1.1)}${plant(1380, 810, 1.8)}${plant(1500, 830, 1.2)}${plant(1220, 840, 1)}`,
            ),
    },
    {
        key: 'comet',
        name: 'Shooting Star',
        cat: 'dreamy',
        draw: () =>
            svgOf(
                lin('s', [[0, '#0c0f40'], [0.6, '#2a2f94'], [1, '#6a6ad0']]),
                `<rect width="1600" height="900" fill="url(#s)"/>${stars(3, 320, 700)}${shoot('t1', 250, 560, 1000, 160)}${shoot('t2', 900, 420, 1300, 250)}${cloud(260, 830, 2.8, '#a9a6ec', 0.6)}${cloud(900, 860, 3.2, '#c4c0f6', 0.55)}${cloud(1450, 820, 2.6, '#9e9be6', 0.6)}`,
            ),
    },
    {
        key: 'sakura',
        name: 'Sakura Shrine',
        cat: 'nature',
        draw: () =>
            svgOf(
                lin('s', [[0, '#2f1b57'], [0.6, '#8b4a9c'], [1, '#e79ac8']]),
                `<rect width="1600" height="900" fill="url(#s)"/>${stars(9, 60, 300)}` +
                    `<path d="M240 900 Q270 650 210 420" stroke="#3a1c40" stroke-width="38" fill="none" stroke-linecap="round"/><path d="M1370 900 Q1330 640 1400 400" stroke="#3a1c40" stroke-width="42" fill="none" stroke-linecap="round"/>` +
                    `${blossoms(250, 330, 250, 80, 3)}${blossoms(1370, 320, 280, 90, 5)}` +
                    `<g fill="#a3243f"><rect x="690" y="470" width="28" height="330"/><rect x="882" y="470" width="28" height="330"/><path d="M630 450 Q800 490 970 450 L985 420 Q800 465 615 420Z"/><rect x="665" y="505" width="270" height="22"/></g>` +
                    `<path d="M0 900 L0 800 Q400 770 800 810 T1600 790 L1600 900Z" fill="#3a1c52"/>${petals(4, 40)}`,
            ),
    },
    {
        key: 'field',
        name: 'Flower Field',
        cat: 'nature',
        draw: () =>
            svgOf(
                lin('s', [[0, '#1a1250'], [0.6, '#4d2c92'], [1, '#a257b8']]) +
                    '<radialGradient id="fg"><stop offset="0" stop-color="#ff9fd2" stop-opacity=".45"/><stop offset="1" stop-color="#ff9fd2" stop-opacity="0"/></radialGradient>',
                `<rect width="1600" height="900" fill="url(#s)"/>${stars(13, 140, 520)}<ellipse cx="800" cy="900" rx="900" ry="260" fill="url(#fg)"/>` +
                    `<path d="M0 900 L0 640 Q400 590 800 640 T1600 620 L1600 900Z" fill="#2a1a52"/>${flowers()}` +
                    `<g fill="#ffe08a"><ellipse cx="470" cy="330" rx="14" ry="8" transform="rotate(-30 470 330)"/><ellipse cx="492" cy="330" rx="14" ry="8" transform="rotate(30 492 330)"/><ellipse cx="1180" cy="290" rx="14" ry="8" transform="rotate(-30 1180 290)"/><ellipse cx="1202" cy="290" rx="14" ry="8" transform="rotate(30 1202 290)"/></g>`,
            ),
    },
    {
        key: 'lake',
        name: 'Moonlit Lake',
        cat: 'nature',
        draw: () =>
            svgOf(
                lin('s', [[0, '#0d1146'], [0.5, '#2a2a8a'], [1, '#6b4ab0']]) + lin('l', [[0, '#4b3a9a'], [1, '#150f40']]),
                `<rect width="1600" height="540" fill="url(#s)"/>${stars(17, 120, 420)}${fullMoon(1250, 220, 56)}` +
                    `<path d="M0 540 L0 440 L180 360 L360 450 L560 380 L760 470 L900 430 L1100 480 L1300 420 L1600 470 L1600 540Z" fill="#1b1458"/>` +
                    `<rect y="540" width="1600" height="360" fill="url(#l)"/>` +
                    `<ellipse cx="1250" cy="650" rx="60" ry="14" fill="#fff6d6" opacity=".55"/><ellipse cx="1250" cy="700" rx="46" ry="10" fill="#fff6d6" opacity=".4"/><ellipse cx="1250" cy="745" rx="70" ry="8" fill="#fff6d6" opacity=".3"/><ellipse cx="1250" cy="800" rx="36" ry="6" fill="#fff6d6" opacity=".25"/>` +
                    `<ellipse cx="500" cy="640" rx="140" ry="4" fill="#fff" opacity=".12"/><ellipse cx="780" cy="720" rx="190" ry="4" fill="#fff" opacity=".1"/><ellipse cx="300" cy="790" rx="160" ry="4" fill="#fff" opacity=".1"/>`,
            ),
    },
    {
        key: 'cozy',
        name: 'Cozy Night',
        cat: 'others',
        draw: () =>
            svgOf(
                lin('w', [[0, '#2a1747'], [1, '#5a2f6a']]) + lin('ws', [[0, '#1c1550'], [1, '#6a3d9c']]) +
                    '<clipPath id="win"><rect x="480" y="120" width="640" height="420" rx="10"/></clipPath><radialGradient id="lamp"><stop offset="0" stop-color="#ffb870" stop-opacity=".55"/><stop offset="1" stop-color="#ffb870" stop-opacity="0"/></radialGradient>',
                `<rect width="1600" height="900" fill="url(#w)"/><circle cx="260" cy="260" r="340" fill="url(#lamp)"/>` +
                    `<rect x="480" y="120" width="640" height="420" rx="10" fill="url(#ws)"/><g clip-path="url(#win)">${stars(8, 40, 300).replace(/cx="(\d+)"/g, (_, v) => `cx="${480 + (Number(v) % 640)}"`)}${city()}</g>` +
                    `<rect x="480" y="120" width="640" height="420" rx="10" fill="none" stroke="#e9c3ff" stroke-opacity=".6" stroke-width="6"/><line x1="800" y1="120" x2="800" y2="540" stroke="#e9c3ff" stroke-opacity=".5" stroke-width="4"/>` +
                    `<path d="M440 100 Q520 260 450 560 L400 560 L400 100Z" fill="#c46aa8" opacity=".9"/><path d="M1160 100 Q1080 260 1150 560 L1200 560 L1200 100Z" fill="#c46aa8" opacity=".9"/>` +
                    `<rect y="640" width="1600" height="260" fill="#5e3475"/><path d="M0 700 Q400 650 800 700 T1600 690 L1600 900 L0 900Z" fill="#7a4a8e"/><ellipse cx="300" cy="680" rx="150" ry="40" fill="#e9c3ff" opacity=".5"/>` +
                    `<g fill="#1f1033"><ellipse cx="760" cy="650" rx="86" ry="42"/><circle cx="690" cy="615" r="30"/><path d="M668 596 L672 566 L692 590Z"/><path d="M698 590 L716 566 L716 600Z"/></g>`,
            ),
    },
    {
        key: 'castle',
        name: 'Dream Castle',
        cat: 'others',
        draw: () =>
            svgOf(
                lin('s', [[0, '#7a5ac8'], [0.5, '#cf8fe0'], [1, '#ffc4e6']]),
                `<rect width="1600" height="900" fill="url(#s)"/>${stars(19, 50, 300)}${moon(1280, 170, 42)}` +
                    `<g fill="#9a70d0"><rect x="760" y="420" width="90" height="200"/><rect x="880" y="360" width="100" height="260"/><rect x="1010" y="440" width="80" height="180"/><rect x="640" y="500" width="70" height="120"/><rect x="1110" y="500" width="70" height="120"/><rect x="700" y="560" width="410" height="80"/><path d="M750 420 L805 330 L860 420Z"/><path d="M868 360 L930 240 L992 360Z"/><path d="M1000 440 L1050 360 L1100 440Z"/><path d="M630 500 L675 430 L720 500Z"/><path d="M1100 500 L1145 430 L1190 500Z"/></g>` +
                    `<g fill="#ffe9a8"><rect x="800" y="470" width="10" height="18"/><rect x="920" y="420" width="10" height="20"/><rect x="920" y="480" width="10" height="20"/><rect x="1040" y="490" width="10" height="18"/><rect x="665" y="540" width="9" height="16"/><rect x="1140" y="540" width="9" height="16"/></g>` +
                    `${cloud(500, 700, 3.2, '#f3c6f0', 0.95)}${cloud(1000, 730, 3.6, '#f7d2f4', 0.95)}${cloud(1450, 700, 3, '#e8b6ec')}${cloud(100, 740, 3, '#e8b6ec')}${cloud(800, 840, 4.4, '#fbe0f6')}`,
            ),
    },
];

const srcCache = new Map<string, string>();
const presetSrc = (p: Preset) => {
    let s = srcCache.get(p.key);
    if (!s) {
        s = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(p.draw())}`;
        srcCache.set(p.key, s);
    }
    return s;
};

async function renderPreset(p: Preset): Promise<File> {
    const img = new Image();
    await new Promise<void>((ok, fail) => {
        img.onload = () => ok();
        img.onerror = () => fail(new Error('render'));
        img.src = presetSrc(p);
    });
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.drawImage(img, 0, 0, 1920, 1080);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.9));
    if (!blob) throw new Error('blob');
    return new File([blob], `${p.key}.jpg`, { type: 'image/jpeg' });
}

/* ============================================================
   Small helpers
   ============================================================ */
function useStored<T>(key: string, initial: T) {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initial;
        try {
            const raw = window.localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : initial;
        } catch {
            return initial;
        }
    });
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            /* ignore */
        }
    }, [key, value]);
    return [value, setValue] as const;
}

const starPath = (r: number, ir: number) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rad = i % 2 ? ir : r;
        return `${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`;
    });
    return `M${pts.join('L')}Z`;
};

function Star({ x, y, r, cls = '' }: { x: number; y: number; r: number; cls?: string }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            <path d={starPath(r, r * 0.48)} fill="#ffc86b" stroke="#ffc86b" strokeWidth="3" strokeLinejoin="round" className={`bk-twinkle ${cls}`} />
        </g>
    );
}

/* ---------- hero illustration ---------- */
function HeroArt() {
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

/* ---------- gallery tile ---------- */
function Tile({
    item,
    busy,
    fav,
    onUse,
    onFav,
    onView,
    onDelete,
}: {
    item: Item;
    busy: boolean;
    fav: boolean;
    onUse: () => void;
    onFav: () => void;
    onView: () => void;
    onDelete?: () => void;
}) {
    const stop = (fn: () => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        fn();
    };

    return (
        <div
            role="button"
            tabIndex={0}
            aria-pressed={item.active}
            aria-label={`Use ${item.name}`}
            className={`bk-tile ${item.active ? 'is-active' : ''}`}
            onClick={onUse}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onUse();
                }
            }}
        >
            <img src={item.src} alt="" loading="lazy" draggable={false} />
            {item.active && (
                <span className="bk-badge">
                    <Check size={20} strokeWidth={3} />
                </span>
            )}
            <span className="bk-tile-bar">
                <span className="bk-tile-name">{item.name}</span>
                <span className="bk-tile-tools">
                    <button type="button" className={`bk-tool ${fav ? 'on' : ''}`} onClick={stop(onFav)} aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}>
                        <Heart size={15} />
                    </button>
                    <button type="button" className="bk-tool" onClick={stop(onView)} aria-label="Preview">
                        <Eye size={15} />
                    </button>
                    {onDelete && (
                        <button type="button" className="bk-tool danger" onClick={stop(onDelete)} aria-label="Delete">
                            <Trash2 size={15} />
                        </button>
                    )}
                </span>
            </span>
            {busy && (
                <span className="bk-busy">
                    <Loader2 size={22} className="bk-spin" />
                    Applying...
                </span>
            )}
        </div>
    );
}

/* ============================================================
   Page
   ============================================================ */
export default function Index({ backgrounds }: { backgrounds: BackgroundRow[] }) {
    const [inputKey, setInputKey] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [drag, setDrag] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>('all');
    const [busy, setBusy] = useState<string | null>(null);
    const [viewing, setViewing] = useState<Item | null>(null);
    const [favs, setFavs] = useStored<string[]>('olu-bg-favs', []);
    const [presetMap, setPresetMap] = useStored<Record<string, number>>('olu-bg-presets', {});

    const form = useForm({ image: null as File | null, activate: true });

    useEffect(() => {
        if (!file) {
            setFileUrl(null);
            return;
        }
        const u = URL.createObjectURL(file);
        setFileUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [file]);

    useEffect(() => {
        if (!viewing) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setViewing(null);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [viewing]);

    const pick = (f: File | null) => {
        setLocalError(null);
        if (!f) {
            setFile(null);
            form.setData('image', null);
            return;
        }
        if (!TYPES.includes(f.type)) {
            setLocalError('Please choose a JPG, PNG or WebP image.');
            return;
        }
        if (f.size > MAX_BYTES) {
            setLocalError('That image is over 8 MB.');
            return;
        }
        setFile(f);
        form.setData('image', f);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/backgrounds', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setFile(null);
                setInputKey((k) => k + 1);
            },
        });
    };

    /* ----- data ----- */
    const active = backgrounds.find((b) => b.is_active) ?? null;
    const mappedActive = active ? Object.entries(presetMap).find(([, id]) => id === active.id)?.[0] : undefined;
    const presetIds = new Set(Object.values(presetMap));

    const presetItems: Item[] = PRESETS.map((p) => ({
        key: `p:${p.key}`,
        kind: 'preset',
        name: p.name,
        cat: p.cat,
        preset: p,
        src: presetSrc(p),
        active: mappedActive === p.key,
    }));

    const uploadItems: Item[] = backgrounds
        .filter((b) => !presetIds.has(b.id))
        .map((b) => ({
            key: `u:${b.id}`,
            kind: 'upload',
            id: b.id,
            mine: b.is_mine,
            name: `Added by ${b.added_by}`,
            src: `/backgrounds/${b.id}/image`,
            active: b.is_active,
        }));

    const gallery =
        tab === 'fav'
            ? [...presetItems, ...uploadItems].filter((i) => favs.includes(i.key))
            : presetItems.filter((i) => tab === 'all' || i.cat === tab);

    /* ----- actions ----- */
    const activateRow = (id: number) =>
        router.post(`/backgrounds/${id}/activate`, {}, { preserveScroll: true, onFinish: () => setBusy(null) });

    const clear = () => router.post('/backgrounds/clear', {}, { preserveScroll: true });

    const removeRow = (id: number) => {
        if (confirm('Delete this background?')) router.delete(`/backgrounds/${id}`, { preserveScroll: true });
    };

    async function applyPreset(p: Preset) {
        const mapped = presetMap[p.key];
        if (mapped && backgrounds.some((b) => b.id === mapped)) {
            activateRow(mapped);
            return;
        }
        try {
            const f = await renderPreset(p);
            const before = new Set(backgrounds.map((b) => b.id));
            router.post(
                '/backgrounds',
                { image: f, activate: true },
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        const rows = (page.props as unknown as { backgrounds?: BackgroundRow[] }).backgrounds ?? [];
                        const created = rows.find((b) => !before.has(b.id) && b.is_active) ?? rows.find((b) => !before.has(b.id));
                        if (created) setPresetMap((m) => ({ ...m, [p.key]: created.id }));
                    },
                    onError: () => setNotice('Could not apply that background. Please try again.'),
                    onFinish: () => setBusy(null),
                },
            );
        } catch {
            setNotice('Could not prepare that background in your browser.');
            setBusy(null);
        }
    }

    const use = (item: Item) => {
        if (busy || item.active) return;
        setNotice(null);
        setBusy(item.key);
        if (item.kind === 'preset' && item.preset) void applyPreset(item.preset);
        else if (item.id) activateRow(item.id);
    };

    const toggleFav = (key: string) => setFavs((f) => (f.includes(key) ? f.filter((k) => k !== key) : [...f, key]));

    const currentName = mappedActive ? PRESETS.find((p) => p.key === mappedActive)?.name : active ? `Added by ${active.added_by}` : 'Default gradient';

    const renderTile = (item: Item) => (
        <Tile
            key={item.key}
            item={item}
            busy={busy === item.key}
            fav={favs.includes(item.key)}
            onUse={() => use(item)}
            onFav={() => toggleFav(item.key)}
            onView={() => setViewing(item)}
            onDelete={item.kind === 'upload' && item.mine && item.id ? () => removeRow(item.id as number) : undefined}
        />
    );

    const TABS: { key: Tab; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'dreamy', label: 'Dreamy' },
        { key: 'nature', label: 'Nature' },
        { key: 'others', label: 'Others' },
        { key: 'fav', label: 'Favorites' },
    ];

    return (
        <AppLayout title="Backgrounds">
            <div className="bk">
                {/* Hero */}
                <section className="bk-hero">
                    <div className="bk-hero-text">
                        <span className="bk-pill">
                            <ImageIcon size={16} />
                            Backgrounds
                        </span>
                        <h1 className="bk-title">
                            Backgrounds
                            <Heart size={34} />
                        </h1>
                        <p className="bk-sub">
                            Personalize your little universe with beautiful backgrounds.
                            <small>
                                Make it feel more like home, together. <Heart size={15} />
                            </small>
                        </p>
                    </div>
                    <HeroArt />
                </section>

                {/* Upload */}
                <section className="bk-panel">
                    <div className="bk-up">
                        <div>
                            <div className="bk-head">
                                <h2>
                                    <Sparkle size={20} />
                                    Upload Your Own
                                </h2>
                            </div>
                            <p className="bk-desc">Use a custom background image (PNG, JPG, WebP - up to 8 MB).</p>

                            <form onSubmit={submit} className="bk-up-row">
                                <label
                                    className={`bk-drop ${drag ? 'drag' : ''} ${file ? 'has' : ''}`}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDrag(true);
                                    }}
                                    onDragLeave={() => setDrag(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDrag(false);
                                        pick(e.dataTransfer.files?.[0] ?? null);
                                    }}
                                >
                                    <input
                                        key={inputKey}
                                        type="file"
                                        className="bk-file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => pick(e.target.files?.[0] ?? null)}
                                    />
                                    {file && fileUrl ? (
                                        <>
                                            <img src={fileUrl} alt="" className="bk-drop-thumb" />
                                            <span className="bk-drop-name">{file.name}</span>
                                            <small>{(file.size / 1048576).toFixed(1)} MB - click to change</small>
                                            <button
                                                type="button"
                                                className="bk-drop-x"
                                                aria-label="Remove picture"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    pick(null);
                                                    setInputKey((k) => k + 1);
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud size={38} />
                                            <span>
                                                <strong>Choose File</strong> or Drag &amp; Drop
                                            </span>
                                            <small>Your image will be used as the background.</small>
                                        </>
                                    )}
                                </label>

                                <div className="bk-up-side">
                                    <label className="bk-check">
                                        <input type="checkbox" checked={form.data.activate} onChange={(e) => form.setData('activate', e.target.checked)} />
                                        Use it right away
                                    </label>
                                    <button type="submit" className="bk-upload-btn" disabled={form.processing || !file}>
                                        <Upload size={18} />
                                        {form.processing ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>
                            </form>
                            {(form.errors.image || localError) && <p className="bk-error">{form.errors.image ?? localError}</p>}
                        </div>

                        <aside className="bk-current">
                            <h3>
                                <ImageIcon size={17} />
                                Current Background
                            </h3>
                            <div className="bk-current-img">
                                {active && <img src={`/backgrounds/${active.id}/image`} alt="" />}
                                {active && (
                                    <button type="button" className="bk-current-reset" onClick={clear} aria-label="Use the default gradient" title="Use the default gradient">
                                        <RotateCcw size={16} />
                                    </button>
                                )}
                            </div>
                            <small>
                                <strong>{currentName}</strong>
                                <br />
                                Shown behind the log-in screen, so anyone who visits the site can see it.
                            </small>
                        </aside>
                    </div>
                </section>

                {/* Default gallery */}
                <section className="bk-panel">
                    <div className="bk-head">
                        <h2>
                            <Sparkle size={20} />
                            Choose a Default Background
                        </h2>
                        <div className="bk-tabs" role="tablist">
                            {TABS.map((t) => (
                                <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
                                    {t.key === 'fav' && <Heart size={13} />}
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {notice && <p className="bk-notice">{notice}</p>}

                    <div className="bk-grid">
                        {gallery.length === 0 ? (
                            <p className="bk-empty">No favorites yet. Tap the heart on any background to save it here.</p>
                        ) : (
                            gallery.map(renderTile)
                        )}
                    </div>
                </section>

                {/* History / custom uploads */}
                {uploadItems.length > 0 && (
                    <section className="bk-panel">
                        <div className="bk-head">
                            <h2>
                                <Sparkle size={20} />
                                Your Uploads &amp; History
                            </h2>
                        </div>
                        <div className="bk-grid">{uploadItems.map(renderTile)}</div>
                    </section>
                )}
            </div>

            {/* Live preview */}
            {viewing && (
                <div className="bk-lightbox" role="dialog" aria-modal="true" aria-label="Background preview" onClick={() => setViewing(null)}>
                    <div className="bk-lightbox-card" onClick={(e) => e.stopPropagation()}>
                        <img src={viewing.src} alt="" />
                        <div className="bk-lightbox-foot">
                            <strong>{viewing.name}</strong>
                            <div className="bk-lightbox-actions">
                                {!viewing.active && (
                                    <button
                                        type="button"
                                        className="bk-btn"
                                        onClick={() => {
                                            use(viewing);
                                            setViewing(null);
                                        }}
                                    >
                                        <Check size={16} />
                                        Use this background
                                    </button>
                                )}
                                <button type="button" className="bk-btn ghost" onClick={() => setViewing(null)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}