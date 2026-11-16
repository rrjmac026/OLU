import { Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { ListMusic, Pause, Play, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { next, seek, setPlaylist, toggle, toggleMute, usePlayer } from '@/lib/player';
import type { PlayerSong } from '@/lib/player';

export type { PlayerSong } from '@/lib/player';

export default function HomePlayer({ songs }: { songs: PlayerSong[] }) {
    const { currentId, playing, progress, muted } = usePlayer();

    useEffect(() => {
        setPlaylist(songs);
    }, [songs]);

    const song = songs.find((s) => s.id === currentId) ?? songs[0];

    if (!song) {
        return (
            <div className="home-player">
                <Link href="/music" className="home-play" aria-label="Add a song">
                    <Play size={26} fill="currentColor" />
                </Link>
                <div className="home-player-text">
                    <strong>A Special Song for You</strong>
                    <small>Upload a song in the Music corner ♡</small>
                </div>
            </div>
        );
    }

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
                <div
                    className="home-bar seek"
                    onClick={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        seek((e.clientX - r.left) / r.width);
                    }}
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                >
                    <span style={{ width: `${progress}%` }} />
                </div>
            </div>
            <div className="home-player-tools">
                <button type="button" className="home-tool" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
                    {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <Link href="/music" className="home-tool" aria-label="All songs">
                    <ListMusic size={20} />
                </Link>
            </div>
        </div>
    );
}