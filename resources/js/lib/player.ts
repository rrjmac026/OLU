import { useSyncExternalStore } from 'react';

export type PlayerSong = { id: number; title: string; artist: string | null; audio_url: string };
export type RepeatMode = 'off' | 'all' | 'one';

type PlayerState = {
    currentId: number | null;
    playing: boolean;
    progress: number;
    muted: boolean;
    shuffle: boolean;
    repeat: RepeatMode;
};

let state: PlayerState = {
    currentId: null,
    playing: false,
    progress: 0,
    muted: false,
    shuffle: false,
    repeat: 'all',
};
let playlist: PlayerSong[] = [];
let audio: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();

function set(patch: Partial<PlayerState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
}

function getAudio(): HTMLAudioElement {
    if (!audio) {
        const a = new Audio();
        a.preload = 'metadata';
        a.addEventListener('timeupdate', () =>
            set({ progress: a.duration ? (a.currentTime / a.duration) * 100 : 0 }),
        );
        a.addEventListener('play', () => set({ playing: true }));
        a.addEventListener('pause', () => set({ playing: false }));
        a.addEventListener('ended', () => advance(true, false));
        audio = a;
    }
    return audio;
}

function loadSong(song: PlayerSong, autoplay: boolean) {
    const a = getAudio();
    a.src = song.audio_url;
    set({ currentId: song.id, progress: 0, playing: false });
    if (autoplay) a.play().catch(() => {});
}

// manual = true when the user pressed "next"
function pickNext(manual: boolean): PlayerSong | null {
    if (playlist.length === 0) return null;

    if (state.shuffle && playlist.length > 1) {
        let n: PlayerSong;
        do {
            n = playlist[Math.floor(Math.random() * playlist.length)];
        } while (n.id === state.currentId);
        return n;
    }

    const i = playlist.findIndex((s) => s.id === state.currentId);
    const atEnd = i === playlist.length - 1;
    // song ended on its own, last in the list, repeat off → stop
    if (atEnd && !manual && state.repeat === 'off') return null;

    return playlist[(i + 1) % playlist.length];
}

function advance(autoplay: boolean, manual: boolean) {
    const a = getAudio();

    // repeat one: only when the song ends by itself ("next" still skips)
    if (!manual && state.repeat === 'one') {
        a.currentTime = 0;
        a.play().catch(() => {});
        return;
    }

    const n = pickNext(manual);
    if (!n) {
        a.pause();
        a.currentTime = 0;
        set({ progress: 0 });
        return;
    }
    if (n.id === state.currentId) {
        a.currentTime = 0;
        if (autoplay) a.play().catch(() => {});
        return;
    }
    loadSong(n, autoplay);
}

/* ---------- public API ---------- */

export function setPlaylist(songs: PlayerSong[]) {
    playlist = songs;
    const a = getAudio();

    if (songs.length === 0) {
        a.pause();
        a.removeAttribute('src');
        a.load();
        set({ currentId: null, playing: false, progress: 0 });
        return;
    }
    // first visit, or the current song was deleted
    if (!songs.some((s) => s.id === state.currentId)) loadSong(songs[0], false);
}

export function playSong(id: number) {
    if (id === state.currentId) {
        toggle();
        return;
    }
    const song = playlist.find((s) => s.id === id);
    if (song) loadSong(song, true);
}

export function toggle() {
    const a = getAudio();
    if (a.paused) a.play().catch(() => {});
    else a.pause();
}

export function next() {
    advance(state.playing, true);
}

export function seek(pct: number) {
    const a = getAudio();
    if (a.duration) a.currentTime = Math.min(Math.max(pct, 0), 1) * a.duration;
}

export function toggleMute() {
    const a = getAudio();
    a.muted = !a.muted;
    set({ muted: a.muted });
}

export function toggleShuffle() {
    set({ shuffle: !state.shuffle });
}

// all → one → off → all …
export function cycleRepeat() {
    const order: RepeatMode[] = ['all', 'one', 'off'];
    set({ repeat: order[(order.indexOf(state.repeat) + 1) % order.length] });
}

export function usePlayer(): PlayerState {
    return useSyncExternalStore(
        (cb) => {
            listeners.add(cb);
            return () => listeners.delete(cb);
        },
        () => state,
        () => state,
    );
}