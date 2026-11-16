import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { ListMusic, Pause, Play, SkipForward, Volume2, VolumeX } from 'lucide-react';

export type PlayerSong = { id: number; title: string; artist: string | null; audio_url: string };

export default function HomePlayer({ songs }: { songs: PlayerSong[] }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [muted, setMuted] = useState(false);

    const song = songs[index];

    // when the track changes while playing, keep playing
    useEffect(() => {
        if (playing) audioRef.current?.play().catch(() => setPlaying(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index]);

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
        const a = audioRef.current;
        if (!a) return;
        if (a.paused) a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        else { a.pause(); setPlaying(false); }
    };

    const next = () => {
        if (songs.length === 1) {
            const a = audioRef.current;
            if (a) { a.currentTime = 0; if (playing) a.play().catch(() => {}); }
            return;
        }
        setIndex((i) => (i + 1) % songs.length);
        setProgress(0);
    };

    const seek = (e: React.MouseEvent<HTMLDivElement>) => {
        const a = audioRef.current;
        if (!a || !a.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration;
    };

    return (
        <div className="home-player">
            <audio
                ref={audioRef}
                src={song.audio_url}
                muted={muted}
                preload="metadata"
                onTimeUpdate={(e) => {
                    const a = e.currentTarget;
                    setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
                }}
                onEnded={next}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
            />
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
                <button type="button" className="home-tool" onClick={() => setMuted((m) => !m)} aria-label="Mute">
                    {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <Link href="/music" className="home-tool" aria-label="All songs"><ListMusic size={20} /></Link>
            </div>
        </div>
    );
}