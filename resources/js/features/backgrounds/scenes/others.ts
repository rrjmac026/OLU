import type { Preset } from '../types';
import { cloud, fullMoon, lin, moon, radial, rng, shoot, sparkle, stars, svgOf } from './helpers';
import { birdFly, meteor, rain, skyLanterns, steam, zzz } from './motion';

function city() {
    const r = rng(21);
    let b = '';
    const w = ['', '', ''];
    for (let i = 0; i < 16; i++) {
        const h = 90 + r() * 170;
        const x = 480 + i * 42;
        b += `<rect x="${x}" y="${(540 - h).toFixed(0)}" width="34" height="${h.toFixed(0)}" fill="#2c1a55"/>`;
        for (let j = 0; j < 5; j++) {
            if (r() > 0.45) w[(i + j) % 3] += `<rect x="${x + 7}" y="${(540 - h + 14 + j * 24).toFixed(0)}" width="6" height="9" fill="#ffe08a" opacity=".85"/>`;
        }
    }
    return `${b}<g class="tw">${w[0]}</g><g class="tw tw2">${w[1]}</g><g class="tw tw3">${w[2]}</g>`;
}

function fairyLights() {
    const cols = ['#ffd08a', '#ff9fd2', '#ffe9a8', '#c9a6ff'];
    let o = '';
    for (let a = 0; a < 4; a++) {
        const x0 = -20 + a * 410;
        const x1 = x0 + 410;
        const xm = (x0 + x1) / 2;
        o += `<path d="M${x0} 50 Q${xm} 140 ${x1} 50" stroke="#e9c3ff" stroke-opacity=".45" stroke-width="3" fill="none"/>`;
        for (let k = 1; k <= 5; k++) {
            const t = k / 6;
            const u = 1 - t;
            const x = u * u * x0 + 2 * u * t * xm + t * t * x1;
            const y = u * u * 50 + 2 * u * t * 140 + t * t * 50 + 10;
            const c = cols[(a + k) % 4];
            o += `<g class="pu" style="animation-delay:-${(k * 0.7 + a).toFixed(1)}s"><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="16" fill="${c}" opacity=".25"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="6" fill="${c}"/></g>`;
        }
    }
    return o;
}

export const cozy: Preset = {
    key: 'cozy',
    name: 'Cozy Night',
    cat: 'others',
    draw: () =>
        svgOf(
            lin('w', [[0, '#2a1747'], [1, '#5a2f6a']]) +
                lin('ws', [[0, '#1c1550'], [1, '#6a3d9c']]) +
                radial('lamp', '#ffb870', 0.6) +
                '<clipPath id="win"><rect x="480" y="120" width="640" height="420" rx="10"/></clipPath>',
            `<rect width="1600" height="900" fill="url(#w)"/><g class="fk"><circle cx="260" cy="400" r="380" fill="url(#lamp)"/></g>` +
                `<rect x="480" y="120" width="640" height="420" rx="10" fill="url(#ws)"/>` +
                `<g clip-path="url(#win)">${stars(8, 40, 300).replace(/cx="(\d+)"/g, (_, v) => `cx="${480 + (Number(v) % 640)}"`)}${fullMoon(980, 210, 26)}${cloud(720, 230, 0.9, '#8f7ad0', 0.5)}${city()}${rain(33, 38, 480, 1120, 120)}</g>` +
                `<rect x="480" y="120" width="640" height="420" rx="10" fill="none" stroke="#e9c3ff" stroke-opacity=".6" stroke-width="6"/><line x1="800" y1="120" x2="800" y2="540" stroke="#e9c3ff" stroke-opacity=".5" stroke-width="4"/>` +
                `<rect x="460" y="540" width="680" height="16" rx="6" fill="#7a4a8e"/>` +
                `<g class="cs"><path d="M440 100 Q520 260 450 560 L400 560 L400 100Z" fill="#c46aa8" opacity=".9"/></g><g class="cs" style="animation-delay:-2s"><path d="M1160 100 Q1080 260 1150 560 L1200 560 L1200 100Z" fill="#c46aa8" opacity=".9"/></g>` +
                `${fairyLights()}` +
                `<path d="M0 730 Q300 650 700 690 Q900 705 1200 685 L1200 900 L0 900Z" fill="#8a4f9e"/><path d="M0 800 Q400 750 900 790 L1200 780 L1200 900 L0 900Z" fill="#6a3a82"/>` +
                `<ellipse cx="230" cy="705" rx="130" ry="36" fill="#e9c3ff" opacity=".8"/>` +
                // lamp + mug
                `<path d="M215 330 L305 330 L283 262 L237 262Z" fill="#ffd08a"/><rect x="256" y="330" width="8" height="150" fill="#c9a6ff"/><ellipse cx="260" cy="484" rx="34" ry="8" fill="#c9a6ff"/>` +
                `<rect x="326" y="452" width="34" height="30" rx="6" fill="#e9c3ff"/><path d="M360 460 Q376 462 372 474 Q368 480 360 478" fill="none" stroke="#e9c3ff" stroke-width="4"/>${steam(343, 446)}` +
                // cat
                `<g class="br"><g fill="#1f1033"><path d="M690 690 Q720 640 790 640 Q850 650 850 690 Q850 720 760 722 Q690 722 690 690Z"/><circle cx="700" cy="660" r="30"/><path d="M678 641 L682 611 L702 635Z"/><path d="M708 635 L726 611 L726 645Z"/><g class="tail"><path d="M850 690 Q900 690 890 725" stroke="#1f1033" stroke-width="14" fill="none" stroke-linecap="round"/></g></g></g>` +
                `${zzz(716, 604, 1)}` +
                // plant
                `<g transform="translate(1380 650)"><path d="M-44 0 L44 0 L30 100 L-30 100Z" fill="#c46aa8"/><g class="sw" style="--a:2.5deg"><ellipse cx="-30" cy="-30" rx="14" ry="44" transform="rotate(-30 -30 -30)" fill="#4a8f7a"/><ellipse cx="30" cy="-34" rx="14" ry="44" transform="rotate(30 30 -34)" fill="#4a8f7a"/><ellipse cx="0" cy="-50" rx="14" ry="50" fill="#5aa88f"/></g></g>`,
        ),
};

export const castle: Preset = {
    key: 'castle',
    name: 'Dream Castle',
    cat: 'others',
    draw: () =>
        svgOf(
            lin('s', [[0, '#7a5ac8'], [0.5, '#cf8fe0'], [1, '#ffc4e6']]) + radial('cg', '#fff0fa', 0.8),
            `<rect width="1600" height="900" fill="url(#s)"/>${stars(19, 50, 300)}${moon(1280, 170, 44)}${shoot('t1', 200, 200, 420, 90)}` +
                `${meteor(600, 50, 140, 27, 3, 14, 560)}` +
                `<g class="pu" style="animation-duration:6s"><circle cx="900" cy="480" r="420" fill="url(#cg)"/></g>` +
                `${birdFly(300, 1, 55, 10, '#6a4aa8')}${birdFly(340, 0.8, 65, 35, '#6a4aa8')}${birdFly(260, 0.9, 48, 22, '#6a4aa8')}` +
                `<g fill="#9a70d0"><rect x="760" y="420" width="90" height="200"/><rect x="880" y="360" width="100" height="260"/><rect x="1010" y="440" width="80" height="180"/><rect x="640" y="500" width="70" height="120"/><rect x="1110" y="500" width="70" height="120"/><rect x="700" y="560" width="410" height="80"/><path d="M750 420 L805 330 L860 420Z"/><path d="M868 360 L930 240 L992 360Z"/><path d="M1000 440 L1050 360 L1100 440Z"/><path d="M630 500 L675 430 L720 500Z"/><path d="M1100 500 L1145 430 L1190 500Z"/></g>` +
                `<g fill="#b38be0"><rect x="880" y="360" width="22" height="260"/><rect x="760" y="420" width="18" height="200"/><rect x="1010" y="440" width="16" height="180"/></g>` +
                // flags
                `<rect x="929" y="196" width="3" height="48" fill="#fff"/><path d="M932 198 L972 212 L932 226Z" fill="#ff9fd2"><animate attributeName="d" dur="1.4s" repeatCount="indefinite" values="M932 198 L974 208 L932 226Z;M932 198 L970 218 L932 226Z;M932 198 L974 208 L932 226Z"/></path>` +
                `<rect x="804" y="298" width="2.5" height="34" fill="#fff"/><path d="M806 300 L836 309 L806 318Z" fill="#ffd3f2"><animate attributeName="d" dur="1.2s" repeatCount="indefinite" values="M806 300 L838 306 L806 318Z;M806 300 L834 314 L806 318Z;M806 300 L838 306 L806 318Z"/></path>` +
                `<rect x="1049" y="328" width="2.5" height="34" fill="#fff"/><path d="M1051 330 L1081 339 L1051 348Z" fill="#ffd3f2"><animate attributeName="d" dur="1.3s" repeatCount="indefinite" values="M1051 330 L1083 336 L1051 348Z;M1051 330 L1079 344 L1051 348Z;M1051 330 L1083 336 L1051 348Z"/></path>` +
                // windows
                `<g class="pu" style="animation-duration:3s" fill="#ffe9a8"><rect x="800" y="470" width="10" height="18"/><rect x="920" y="480" width="10" height="20"/><rect x="665" y="540" width="9" height="16"/></g>` +
                `<g class="pu" style="animation-duration:4.2s;animation-delay:-1s" fill="#ffe9a8"><rect x="920" y="420" width="10" height="20"/><rect x="1140" y="540" width="9" height="16"/><rect x="780" y="575" width="8" height="14"/></g>` +
                `<g class="pu" style="animation-duration:3.6s;animation-delay:-2s" fill="#ffe9a8"><rect x="1040" y="490" width="10" height="18"/><rect x="1000" y="575" width="8" height="14"/></g>` +
                `${sparkle(930, 150, 16, '#fff', 0)}${sparkle(640, 380, 12, '#fff', 1)}${sparkle(1200, 380, 12, '#fff', 2)}${sparkle(500, 250, 9, '#fff', 1.5)}${sparkle(1450, 330, 10, '#fff', 0.5)}${sparkle(760, 300, 9, '#fff', 2.4)}${sparkle(1080, 270, 10, '#ffd3f2', 0.8)}` +
                `${skyLanterns(6, 7)}` +
                `${cloud(500, 740, 3.2, '#f3c6f0', 0.95)}${cloud(1000, 760, 3.6, '#f7d2f4', 0.95)}${cloud(1450, 730, 3, '#e8b6ec')}${cloud(100, 770, 3, '#e8b6ec')}${cloud(800, 860, 4.4, '#fbe0f6')}`,
        ),
};