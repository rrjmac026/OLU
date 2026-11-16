import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ListMusic, Pause, Play, SkipForward, Volume2, VolumeX } from 'lucide-react';

export type PlayerSong = { id: number; title: string; artist: string | null; audio_url: string };

/* ---- lives outside React, so it survives page changes ---- */
let audio: HTMLAudioElement | null = null;
let currentId: number | null = null;
let playlist: PlayerSong[] = [];

function load(song: PlayerSong, autoplay: boolean) {
    const a = getAudio();
    currentId = song.id;
    a.src = song.audio_url;
    if (autoplay) a.play().catch(() => {});
}

function advance(autoplay: boolean) {
    const a = getAudio();
    if (playlist.length === 0) return;
    const i = playlist.findIndex((s) => s.id === currentId);
    const n = playlist[(i + 1) % playlist.length];
    if (n.id === currentId) {
        a.currentTime = 0;
        if (autoplay) a.play().catch(() => {});
    } else {
        load(n, autoplay);
    }
}

function getAudio(): HTMLAudioElement {
    if (!audio) {
        audio = new Audio();
        audio.preload = 'metadata';
        // keeps going to the next song even when you're on another page
        audio.addEventListener('ended', () => advance(true));
    }
    return audio;
}
/* ----------------------------------------------------------- */

export default function HomePlayer({ songs }: { songs: PlayerSong[] }) {
    const [activeId, setActiveId] = useState<number | null>(currentId);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [muted, setMuted] = useState(false);

    const song = songs.find((s) => s.id === activeId) ?? songs[0];

    useEffect(() => {
        const a = getAudio();
        playlist = songs;

        // first visit: load the first song (without playing it)
        if (currentId === null && songs[0]) load(songs[0], false);

        const sync = () => {
            setActiveId(currentId);
            setPlaying(!a.paused);
            setMuted(a.muted);
            setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
        };

        sync(); // pick up whatever is already playing
        const events = ['timeupdate', 'play', 'pause', 'loadedmetadata', 'emptied'];
        events.forEach((e) => a.addEventListener(e, sync));
        return () => events.forEach((e) => a.removeEventListener(e, sync));
    }, [songs]);

    if (!song) {
        return (
            <div className="home-player">
                <Link href="/music" className="home-play" aria-label="Add a song"><Play size={26} fill="currentColor" /></Link>
                <div className="home-player-text">
                    <strong>A Special Song for You</strong>
                    <small>Upload a song in the Music corner ♡</small>
                </div>
            </div>
        );
    }

    const toggle = () => {
        const a = getAudio();
        if (a.paused) a.play().catch(() => setPlaying(false));
        else a.pause();
    };

    const next = () => {
        advance(!getAudio().paused);
        setProgress(0);
    };

    const seek = (e: React.MouseEvent<HTMLDivElement>) => {
        const a = getAudio();
        if (!a.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration;
    };

    const toggleMute = () => {
        const a = getAudio();
        a.muted = !a.muted;
        setMuted(a.muted);
    };

    return (
        <div className="home-player">
            <button type="button" className="home-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}
            </button>
            <button type="button" className="home-skip" onClick={next} aria-label="Next song">
                <SkipForward size={20} fill="currentColor" />
            </button>
            <div className="home-player-text">
                <strong>{song.title}</strong>
                <small>{song.artist ?? 'Our Song'} ♡</small>
                <div className="home-bar seek" onClick={seek} role="progressbar" aria-valuenow={Math.round(progress)}>
                    <span style={{ width: `${progress}%` }} />
                </div>
            </div>
            <div className="home-player-tools">
                <button type="button" className="home-tool" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
                    {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <Link href="/music" className="home-tool" aria-label="All songs"><ListMusic size={20} /></Link>
            </div>
        </div>
    );
}