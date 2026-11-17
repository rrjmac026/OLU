import type { Preset } from '../types';
import { cloud, goldStar, grass, lin, moon, plant, radial, shoot, sleepingCat, sparkle, stars, svgOf } from './helpers';
import { birdFly, fireflies, meteor } from './motion';

function rays() {
    const p = (a: number) => `${(800 + Math.cos((a * Math.PI) / 180) * 1100).toFixed(0)} ${(700 + Math.sin((a * Math.PI) / 180) * 1100).toFixed(0)}`;
    let o = '';
    for (let i = 0; i < 14; i++) {
        const a1 = (i * 360) / 14;
        o += `<path d="M800 700 L${p(a1)} L${p(a1 + 7)}Z"/>`;
    }
    return o;
}

export const starry: Preset = {
    key: 'starry',
    name: 'Starry Dream',
    cat: 'dreamy',
    draw: () =>
        svgOf(
            lin('s', [[0, '#150f3d'], [0.5, '#43288a'], [1, '#b86bc4']]) + radial('g', '#ff9fe0', 0.5),
            `<rect width="1600" height="900" fill="url(#s)"/>${stars(11, 200)}` +
                `<g class="pu" style="animation-duration:7s"><ellipse cx="800" cy="920" rx="1000" ry="300" fill="url(#g)"/></g>` +
                `${moon(1250, 200, 74)}${shoot('t1', 360, 480, 940, 140)}` +
                `${goldStar(950, 128, 28)}${goldStar(1090, 330, 18, 1)}${goldStar(560, 330, 13, 2)}${goldStar(1360, 470, 22, 0.5)}${goldStar(210, 300, 15, 1.8)}` +
                `${sparkle(300, 190, 14, '#fff', 1)}${sparkle(760, 280, 10, '#fff', 2)}${sparkle(1470, 90, 12, '#fff', 0.5)}${sparkle(180, 420, 9, '#ffd3f2', 1.5)}` +
                `${meteor(500, 50, 160, 28, 1.5, 11, 640)}${meteor(900, 30, 130, 31, 6, 14, 600)}${meteor(150, 160, 140, 26, 10, 17, 560)}` +
                `${fireflies(5, 18, 180, 720, '#ffd3f2')}` +
                `${cloud(180, 800, 2.4, '#e58fd6', 0.9)}${cloud(1500, 820, 2.6, '#b66bd0')}${cloud(1000, 760, 3.4, '#cf84dc')}` +
                `${sleepingCat(1010, 640, 2.2)}` +
                `${cloud(620, 850, 3, '#c978d8', 0.95)}${cloud(1100, 850, 3.2, '#f2a6e0', 0.92)}${cloud(-20, 870, 2.6, '#b06ccc')}${cloud(1400, 880, 2.8, '#e08fd8')}`,
        ),
};

export const sunset: Preset = {
    key: 'sunset',
    name: 'Pink Sunset',
    cat: 'dreamy',
    draw: () =>
        svgOf(
            lin('s', [[0, '#2c2468'], [0.4, '#8f4fa8'], [0.7, '#ff7fa0'], [1, '#ffc58a']]) + radial('sun', '#ffe3a0', 0.95),
            `<rect width="1600" height="900" fill="url(#s)"/>${stars(5, 70, 300)}` +
                `<g class="spin" style="animation-duration:140s"><g fill="#fff0c4" opacity=".12">${rays()}</g></g>` +
                `<g class="pu" style="animation-duration:5s"><circle cx="800" cy="700" r="380" fill="url(#sun)"/></g><circle cx="800" cy="700" r="74" fill="#fff0c4"/>` +
                `<g class="dr" style="animation-duration:24s"><ellipse cx="400" cy="470" rx="320" ry="22" fill="#ff9fb5" opacity=".5"/></g>` +
                `<g class="dr" style="animation-duration:30s;animation-delay:-8s"><ellipse cx="1150" cy="520" rx="380" ry="26" fill="#ffb3b0" opacity=".5"/></g>` +
                `<g class="dr" style="animation-duration:36s;animation-delay:-15s"><ellipse cx="780" cy="400" rx="420" ry="18" fill="#d77fc8" opacity=".45"/></g>` +
                `<g class="dr" style="animation-duration:28s;animation-delay:-4s"><ellipse cx="1000" cy="620" rx="300" ry="14" fill="#ffd0b0" opacity=".5"/></g>` +
                `${cloud(300, 330, 1.6, '#c779c9', 0.7)}${cloud(1250, 280, 1.8, '#d98cd0', 0.7)}${cloud(760, 220, 1.3, '#e29ad8', 0.55)}` +
                `${birdFly(260, 1.2, 50, 0, '#3a1c52')}${birdFly(300, 0.9, 62, 18, '#3a1c52')}${birdFly(220, 1, 74, 40, '#3a1c52')}${birdFly(330, 0.8, 58, 30, '#3a1c52')}` +
                `<path d="M0 760 Q260 700 520 750 T1040 740 T1600 730 L1600 900 L0 900Z" fill="#7a3f8f" opacity=".85"/>` +
                `<path d="M0 800 Q400 750 800 810 T1600 780 L1600 900 L0 900Z" fill="#4a2872"/>` +
                `<path d="M0 900 L0 840 Q400 810 800 850 T1600 830 L1600 900Z" fill="#2a1448"/>` +
                `${fireflies(7, 14, 500, 850, '#ffe3a0')}` +
                `${grass(23, 70, 900, 70, '#2a1448')}` +
                `${plant(120, 870, 1.7)}${plant(300, 880, 1.1)}${plant(1380, 860, 1.9)}${plant(1500, 880, 1.2)}${plant(1220, 890, 1)}`,
        ),
};

export const comet: Preset = {
    key: 'comet',
    name: 'Shooting Star',
    cat: 'dreamy',
    draw: () =>
        svgOf(
            lin('s', [[0, '#0a0d3a'], [0.6, '#2a2f94'], [1, '#6a6ad0']]) +
                radial('n1', '#7a5cff', 0.35) +
                radial('n2', '#ff7ad9', 0.22) +
                '<linearGradient id="au" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5af0c8" stop-opacity="0"/><stop offset=".5" stop-color="#7a8cff" stop-opacity=".55"/><stop offset="1" stop-color="#b25cff" stop-opacity="0"/></linearGradient>',
            `<rect width="1600" height="900" fill="url(#s)"/>` +
                `<g class="pu" style="animation-duration:9s"><ellipse cx="420" cy="260" rx="520" ry="200" fill="url(#n1)"/></g>` +
                `<g class="pu" style="animation-duration:11s;animation-delay:-4s"><ellipse cx="1200" cy="420" rx="480" ry="190" fill="url(#n2)"/></g>` +
                `<g class="ms" style="animation-duration:34s"><path d="M-300 260 Q80 140 420 230 T1020 200 T1600 260 T1900 220 L1900 400 Q1500 330 1100 380 T400 360 T-300 400Z" fill="url(#au)" opacity=".55"/></g>` +
                `${stars(3, 360, 700)}` +
                `${shoot('t1', 250, 560, 1000, 160)}${goldStar(1000, 160, 24)}${shoot('t2', 900, 420, 1300, 250)}${goldStar(1300, 250, 15, 1)}${shoot('t3', 120, 220, 420, 90)}` +
                `${meteor(200, 40, 150, 27, 1, 9, 620)}${meteor(700, 20, 170, 30, 4.5, 13, 640)}${meteor(1050, 90, 140, 25, 8, 11, 520)}${meteor(450, 200, 130, 29, 12, 16, 560)}` +
                `${sparkle(600, 220, 13, '#fff', 0.5)}${sparkle(1450, 160, 11, '#d9d6ff', 1.5)}${sparkle(200, 480, 9, '#fff', 2)}${sparkle(1100, 90, 10, '#fff', 1)}${sparkle(820, 500, 8, '#ffd3f2', 0.8)}` +
                `${cloud(260, 830, 2.8, '#a9a6ec', 0.65)}${cloud(900, 860, 3.2, '#c4c0f6', 0.6)}${cloud(1450, 820, 2.6, '#9e9be6', 0.65)}` +
                `${cloud(560, 890, 2.4, '#d6d3ff', 0.5)}${cloud(1180, 900, 2.4, '#d6d3ff', 0.5)}`,
        ),
};