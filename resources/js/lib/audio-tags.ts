import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';

export type AudioInfo = { title: string | null; artist: string | null };

// "Artist - Title.mp3" → { artist, title }; otherwise the whole name is the title
function fromFilename(name: string): AudioInfo {
    const base = name.replace(/\.[^.]+$/, '').replace(/_/g, ' ').trim();
    const m = base.match(/^(.+?)\s+-\s+(.+)$/);
    if (m) return { artist: m[1].trim(), title: m[2].trim() };
    return { title: base || null, artist: null };
}

export function readAudioInfo(file: File): Promise<AudioInfo> {
    const fallback = fromFilename(file.name);

    return new Promise((resolve) => {
        try {
            jsmediatags.read(file, {
                onSuccess: ({ tags }) =>
                    resolve({
                        title: tags.title?.trim() || fallback.title,
                        artist: tags.artist?.trim() || fallback.artist,
                    }),
                onError: () => resolve(fallback),
            });
        } catch {
            resolve(fallback);
        }
    });
}