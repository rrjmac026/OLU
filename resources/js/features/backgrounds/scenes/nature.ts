import type { Preset } from '../types';
import { blossoms, cloud, fullMoon, lin, moon, pine, radial, rng, shoot, sparkle, stars, svgOf } from './helpers';
import { birdFly, butterfly, fireflies, glints, meteor, mist, petalsFall, reeds, ripple, waves } from './motion';

/* ---------------- Flower field helpers ---------------- */
function flowers() {
    const r = rng(7);
    const ys = Array.from({ length: 64 }, () => 620 + r() * 260).sort((a, b) => a - b);
    const cols = ['#ff8fc7', '#ffb3dc', '#d98cff', '#ff7fb5'];
    const groups = ['', '', '', ''];
    ys.forEach((y, i) => {
        const x = r() * 1600;
        const s = 10 + ((y - 600) / 300) * 26;
        const ps = [0, 72, 144, 216, 288]
            .map((a) => `<ellipse cx="0" cy="${(-s * 0.7).toFixed(1)}" rx="${(s * 0.38).toFixed(1)}" ry="${(s * 0.62).toFixed(1)}" transform="rotate(${a})" fill="${cols[i % 4]}"/>`)
            .join('');
        groups[Math.floor(i / 16)] += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><path d="M0 0 L0 ${(s * 2.2).toFixed(0)}" stroke="#4a2f7a" stroke-width="${(s / 6 + 1).toFixed(1)}"/>${ps}<circle r="${(s * 0.28).toFixed(1)}" fill="#ffe08a"/></g>`;
    });
    return groups.map((g, i) => `<g class="sk" style="--a:${(1.6 + i * 0.8).toFixed(1)}deg;animation-duration:${(4.2 + i * 0.5).toFixed(1)}s;animation-delay:-${(i * 1.1).toFixed(1)}s">${g}</g>`).join('');
}

const bigFlower = (x: number, y: number) =>
    `<g class="pu" style="animation-duration:4.5s"><circle cx="${x}" cy="${y}" r="190" fill="url(#fg)"/></g>` +
    `<g class="sw" style="--a:2deg;animation-duration:6s"><path d="M${x} ${y} L${x} ${y + 260}" stroke="#4a2f7a" stroke-width="10"/>` +
    `<g transform="translate(${x} ${y})">${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="0" cy="-46" rx="26" ry="52" transform="rotate(${a})" fill="#ffb3dc"/>`).join('')}<circle r="22" fill="#ffe08a"/></g></g>`;

/* ---------------- Lake helpers ---------------- */
const MT_BACK =
    '<path d="M0 540 L0 430 L180 340 L360 440 L560 360 L760 460 L900 410 L1100 470 L1300 400 L1600 460 L1600 540Z" fill="#2a2680" opacity=".85"/>';
const MT_MID = '<path d="M0 540 L0 470 L200 400 L420 480 L640 420 L860 490 L1060 450 L1320 500 L1600 450 L1600 540Z" fill="#1b1458"/>';

function moonPath() {
    let o = `<g class="pu" style="animation-duration:6s"><ellipse cx="1250" cy="700" rx="170" ry="200" fill="url(#mr)"/></g>`;
    for (let i = 0; i < 12; i++) {
        o += `<g transform="translate(1250 ${566 + i * 27})"><ellipse class="sh" style="animation-duration:${(2.6 + (i % 4) * 0.5).toFixed(1)}s;animation-delay:-${(i * 0.37).toFixed(2)}s" rx="${(64 - i * 2.2 + (i % 2) * 8).toFixed(0)}" ry="${(3.2 + i * 0.35).toFixed(1)}" fill="#fff6d6" opacity=".6"/></g>`;
    }
    return o;
}

const boat = (x: number, y: number) =>
    `<g class="bob" style="animation-delay:-1.5s"><g transform="translate(${x} ${y})">` +
    `<path d="M-72 0 Q-62 28 -30 32 L42 32 Q72 28 86 -2Z" fill="#0d0829"/>` +
    `<rect x="-3" y="-80" width="5" height="82" fill="#0d0829"/><path d="M4 -78 L56 -14 L4 -14Z" fill="#2b2070"/>` +
    `<rect x="-62" y="-30" width="2" height="30" fill="#0d0829"/>` +
    `<g class="fk"><circle cx="-60" cy="-14" r="32" fill="url(#bg)"/><rect x="-65" y="-28" width="10" height="14" rx="3" fill="#ffd08a"/></g>` +
    `</g></g>` +
    // reflection
    `<g opacity=".28"><g transform="translate(${x} ${y + 58}) scale(1 -.5)"><path d="M-72 0 Q-62 28 -30 32 L42 32 Q72 28 86 -2Z" fill="#0d0829"/><path d="M4 -78 L56 -14 L4 -14Z" fill="#2b2070"/></g></g>` +
    `<g transform="translate(${x - 60} ${y + 72})"><ellipse class="sh" rx="26" ry="3.5" fill="#ffd08a" opacity=".7"/></g><g transform="translate(${x - 60} ${y + 90})"><ellipse class="sh" style="animation-delay:-1.1s" rx="18" ry="3" fill="#ffd08a" opacity=".6"/></g>`;

export const sakura: Preset = {
    key: 'sakura',
    name: 'Sakura Shrine',
    cat: 'nature',
    draw: () =>
        svgOf(
            lin('s', [[0, '#2f1b57'], [0.6, '#8b4a9c'], [1, '#e79ac8']]) + radial('lg', '#ffb870', 0.7),
            `<rect width="1600" height="900" fill="url(#s)"/>${stars(9, 60, 300)}${moon(1230, 150, 46)}${meteor(300, 60, 140, 28, 3, 15, 560)}` +
                `<path d="M0 760 Q300 690 600 750 T1200 730 T1600 740 L1600 900 L0 900Z" fill="#5a2f80" opacity=".6"/>` +
                `${mist(800, 790, 650, 38, '#e9b8ea', 0.2, 50, 0)}` +
                `<path d="M240 900 Q270 650 210 420" stroke="#3a1c40" stroke-width="38" fill="none" stroke-linecap="round"/><path d="M1370 900 Q1330 640 1400 400" stroke="#3a1c40" stroke-width="42" fill="none" stroke-linecap="round"/>` +
                `<g class="sw" style="--a:1deg;animation-duration:8s">${blossoms(250, 330, 250, 80, 3)}</g>` +
                `<g class="sw" style="--a:1deg;animation-duration:9s;animation-delay:-3s">${blossoms(1370, 320, 280, 90, 5)}</g>` +
                `<g class="sw" style="--a:1.4deg;animation-duration:7s;animation-delay:-2s">${blossoms(560, 250, 140, 28, 8)}</g>` +
                `<g class="sw" style="--a:1.4deg;animation-duration:7.5s;animation-delay:-5s">${blossoms(1050, 260, 140, 28, 9)}</g>` +
                `<g fill="#a3243f"><rect x="690" y="470" width="28" height="330"/><rect x="882" y="470" width="28" height="330"/><path d="M630 450 Q800 490 970 450 L985 420 Q800 465 615 420Z"/><rect x="665" y="505" width="270" height="22"/></g>` +
                `<path d="M0 900 L0 800 Q400 770 800 810 T1600 790 L1600 900Z" fill="#3a1c52"/><path d="M720 900 L880 900 L842 805 L758 805Z" fill="#6a3a82"/>` +
                `<g class="fk"><circle cx="560" cy="720" r="52" fill="url(#lg)"/><rect x="550" y="704" width="20" height="32" rx="6" fill="#ffd08a"/></g><rect x="557" y="736" width="6" height="80" fill="#3a1c40"/>` +
                `<g class="fk" style="animation-delay:-1.4s"><circle cx="1040" cy="720" r="52" fill="url(#lg)"/><rect x="1030" y="704" width="20" height="32" rx="6" fill="#ffd08a"/></g><rect x="1037" y="736" width="6" height="80" fill="#3a1c40"/>` +
                `${mist(500, 840, 520, 34, '#ffd3ea', 0.22, 44, 10)}${mist(1150, 850, 480, 30, '#ffd3ea', 0.2, 52, 24)}` +
                `${fireflies(12, 12, 480, 800, '#ffd9a0')}${petalsFall(4, 36)}${sparkle(800, 380, 10, '#fff', 1)}`,
        ),
};

export const field: Preset = {
    key: 'field',
    name: 'Flower Field',
    cat: 'nature',
    draw: () =>
        svgOf(
            lin('s', [[0, '#1a1250'], [0.6, '#4d2c92'], [1, '#a257b8']]) + radial('fg', '#ff9fd2', 0.5),
            `<rect width="1600" height="900" fill="url(#s)"/>${stars(13, 140, 520)}${shoot('t1', 200, 260, 560, 110)}` +
                `${meteor(900, 40, 150, 28, 2, 12, 600)}${meteor(300, 120, 130, 30, 8, 16, 560)}` +
                `<g class="pu" style="animation-duration:6s"><ellipse cx="800" cy="900" rx="900" ry="260" fill="url(#fg)"/></g>` +
                `<path d="M0 900 L0 640 Q400 590 800 640 T1600 620 L1600 900Z" fill="#2a1a52"/>${flowers()}${bigFlower(800, 520)}` +
                `${butterfly(470, 330, 1.4, '#ffe08a', 0, 140, -60)}${butterfly(1180, 290, 1.4, '#ffe08a', 2, -150, 50)}${butterfly(900, 230, 1.1, '#ffb3dc', 1, 110, 70)}${butterfly(260, 470, 1, '#d9b3ff', 3, 130, -50)}${butterfly(1400, 460, 1.1, '#ffb3dc', 4, -120, -40)}` +
                `${fireflies(31, 36, 360, 820)}${fireflies(33, 14, 560, 860, '#ffb3dc')}${sparkle(700, 300, 11, '#fff', 1)}`,
        ),
};

export const lake: Preset = {
    key: 'lake',
    name: 'Moonlit Lake',
    cat: 'nature',
    draw: () => {
        const farPines = Array.from({ length: 15 }, (_, k) => pine(50 + k * 105 + (k % 3) * 20, 440 + (k % 4) * 14, 0.32, '#150f48', false)).join('');
        return svgOf(
            lin('s', [[0, '#0d1146'], [0.5, '#2a2a8a'], [1, '#6b4ab0']]) +
                lin('l', [[0, '#5a47ad'], [0.35, '#2b2272'], [1, '#120d38']]) +
                radial('mr', '#fff6d6', 0.55) +
                radial('bg', '#ffb870', 0.8) +
                '<clipPath id="wt"><rect y="540" width="1600" height="360"/></clipPath>',
            // sky
            `<rect width="1600" height="560" fill="url(#s)"/>${stars(17, 150, 430)}${shoot('t1', 300, 200, 640, 70)}${fullMoon(1250, 220, 58)}` +
                `${meteor(450, 40, 150, 27, 2, 12, 600)}${meteor(1000, 70, 130, 30, 9, 16, 520)}` +
                `${cloud(900, 190, 1.4, '#9a8be0', 0.35)}${cloud(1450, 120, 1.1, '#b0a2ee', 0.3)}${cloud(300, 230, 1.3, '#8a7bd8', 0.3)}` +
                `${birdFly(150, 1, 70, 5, '#0b0830')}${birdFly(210, 0.8, 85, 40, '#0b0830')}${birdFly(110, 0.9, 62, 22, '#0b0830')}` +
                // mountains
                `${MT_BACK}${MT_MID}${farPines}` +
                `${mist(600, 505, 520, 30, '#8c7cd8', 0.24, 48, 0)}${mist(1200, 520, 460, 26, '#8c7cd8', 0.2, 56, 20)}` +
                // water
                `<rect y="540" width="1600" height="360" fill="url(#l)"/>` +
                `<g clip-path="url(#wt)"><g transform="translate(0 1080) scale(1 -1)" opacity=".22">${MT_BACK}${MT_MID}</g></g>` +
                `${moonPath()}` +
                `<g clip-path="url(#wt)">${waves(560, 890, 13)}</g>` +
                `${glints(41, 36, 560, 880)}` +
                `${ripple(520, 690, 110, 0, 7)}${ripple(860, 790, 150, 2.5, 8)}${ripple(330, 835, 120, 4.5, 7.5)}${ripple(1060, 745, 100, 1.2, 7)}` +
                `${boat(640, 700)}${ripple(640, 740, 92, 1, 6)}` +
                // shores
                `<path d="M0 560 Q180 580 320 690 Q240 780 0 800Z" fill="#0e0a30"/><path d="M1600 580 Q1420 600 1290 700 Q1380 790 1600 810Z" fill="#0e0a30"/>` +
                `${pine(60, 500, 1.6, '#0e0a30')}${pine(190, 560, 1.2, '#0e0a30')}${pine(1540, 520, 1.7, '#0e0a30')}${pine(1420, 590, 1.2, '#0e0a30')}${pine(120, 610, 0.9, '#0e0a30')}${pine(1490, 640, 1, '#0e0a30')}` +
                `${reeds(240, 380, 700, 12, 3, '#0e0a30')}${reeds(1220, 1360, 706, 12, 5, '#0e0a30')}` +
                `${fireflies(41, 22, 520, 840)}` +
                `${mist(800, 870, 760, 40, '#5a47ad', 0.26, 36, 5)}`,
        );
    },
};