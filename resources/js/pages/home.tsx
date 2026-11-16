import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../layouts/app-layout';
import HeroSky from '../components/hero-sky';
import { prettyDate, typeInfo } from '../lib/calendar';
import type { CalendarEvent } from '../lib/calendar';
import { api } from '../lib/http';
import { moodInfo } from '../lib/moods';
import type { SharedProps } from '../types/olu';
// imports
import { Calendar, ChevronRight, Leaf, ListMusic, MoreHorizontal, Music, Play, SkipForward, Smile, Sparkle, Sparkles, Star, Volume2 } from 'lucide-react';
import MemorySlideshow from '../components/memory-slideshow';
import type { MemorySlide } from '../components/memory-slideshow';

type Props = {
    checkin_today: { mood: string } | null;
    next_event: CalendarEvent | null;
    daily_compliment: string | null;
    daily_question: string | null;
    question_answered: boolean;
    bucket?: { done: number; total: number } | null;
    current_song?: { title: string; artist?: string | null } | null;
    memory_photos?: MemorySlide[];
};

export default function Home({
    checkin_today,
    next_event,
    daily_compliment,
    daily_question,
    question_answered,
    bucket = null,
    current_song = null,
    memory_photos = [],
}: Props) {
    const { auth } = usePage<SharedProps>().props;
    const name = auth.user?.display_name ?? auth.user?.name ?? '';

    const mood = checkin_today ? moodInfo(checkin_today.mood) : null;
    const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

    const days = next_event?.days ?? 0;
    const progress = next_event ? Math.round(Math.max(4, (1 - Math.min(days, 30) / 30) * 100)) : 0;
    const ctaHref = mood ? '/questions' : '/checkins';
    const bucketPct = bucket && bucket.total > 0 ? Math.round((bucket.done / bucket.total) * 100) : 0;

    const [compliment, setCompliment] = useState(daily_compliment);
    

    async function another() {
        try {
            const res = await api<{ body: string | null }>(
                'GET',
                `/content/random/compliment${compliment ? `?exclude=${encodeURIComponent(compliment)}` : ''}`,
            );
            if (res.body) setCompliment(res.body);
        } catch {
            // keep showing the current one
        }
    }

    return (
        <AppLayout title="Home">
            <div className="home">
                {/* Hero */}
                <section className="home-hero">
                    <HeroSky />
                    <button type="button" className="home-more" aria-label="More"><MoreHorizontal size={20} /></button>

                    <div className="home-hero-main">
                        <span className="home-pill">
                            <Sparkles size={16} aria-hidden="true" /> {dateLabel}
                        </span>
                        <h1 className="home-hello">
                            Hello, <span>{name}!</span> <em aria-hidden="true">♡</em>
                        </h1>
                        <p className="home-sub">A little place where all our moments live.</p>
                        <Link href={ctaHref} className="home-cta">
                            Let&apos;s make today special <span aria-hidden="true">→</span>
                        </Link>
                    </div>

                    {next_event ? (
                        <Link href="/calendar" className="home-count">
                            <div className="home-count-head">
                                <span aria-hidden="true">{typeInfo(next_event.type).icon}</span>
                                <span className="home-count-title">Our Next {next_event.title}</span>
                            </div>
                            <div className="home-count-num">
                                {days === 0 ? 'Today' : days}
                                {days > 0 && <small> {days === 1 ? 'day' : 'days'}</small>}
                            </div>
                            <div className="home-count-sub">{prettyDate(next_event.date)} ♡</div>
                            <div className="home-bar">
                                <span style={{ width: `${progress}%` }} />
                            </div>
                        </Link>
                    ) : (
                        <Link href="/calendar/create" className="home-count">
                            <div className="home-count-head">
                                <Calendar size={20} aria-hidden="true" />
                                <span className="home-count-title">Nothing planned yet</span>
                            </div>
                            <div className="home-count-sub">Add a special date →</div>
                        </Link>
                    )}
                </section>

                {/* Quick cards */}
                <section className="home-quick">
                    <Link href="/checkins" className="home-quick-card">
                        <span className="home-quick-icon" aria-hidden="true">💗</span>
                        <span className="home-quick-text">
                            <strong>How&apos;s your heart today?</strong>
                            <small>{mood ? `Today: ${mood.emoji} ${mood.label}` : 'Leave a check-in'}</small>
                        </span>
                        <ChevronRight className="home-chev" size={20} aria-hidden="true" />
                    </Link>
                    <Link href="/questions" className="home-quick-card">
                        <span className="home-quick-icon" aria-hidden="true">💬</span>
                        <span className="home-quick-text">
                            <strong>Daily Question</strong>
                            <small>
                                {question_answered
                                    ? 'You answered today'
                                    : (daily_question ?? "Let's know each other more")}
                            </small>
                        </span>
                        <ChevronRight className="home-chev" size={20} aria-hidden="true" />
                    </Link>
                    <Link href="/playroom" className="home-quick-card">
                        <span className="home-quick-icon" aria-hidden="true">🎮</span>
                        <span className="home-quick-text">
                            <strong>Play a Game</strong>
                            <small>Have some fun!</small>
                        </span>
                        <ChevronRight className="home-chev" size={20} aria-hidden="true" />
                    </Link>
                    <Link href="/letters" className="home-quick-card">
                        <span className="home-quick-icon" aria-hidden="true">🎁</span>
                        <span className="home-quick-text">
                            <strong>Open a Surprise</strong>
                            <small>A little something for you</small>
                        </span>
                        <ChevronRight className="home-chev" size={20} aria-hidden="true" />
                    </Link>
                </section>

                {/* Memory + daily life */}
                <section className="home-row home-row-a">
                    <div className="home-panel">
                        <div className="home-panel-head">
                            <h2><Sparkle size={18} fill="currentColor" aria-hidden="true" /> A Little Memory</h2>
                            <Link href="/memories">See all →</Link>
                        </div>
                        <MemorySlideshow slides={memory_photos} />
                    </div>

                    <div className="home-panel">
                        <div className="home-panel-head">
                            <h2>
                                <Leaf size={18} aria-hidden="true" /> Our Daily Life
                            </h2>
                            <Link href="/calendar">View Details →</Link>
                        </div>
                        <div className="home-life">
                            <div className="home-life-col">
                                <div className="home-life-icon" aria-hidden="true">
                                    {mood ? mood.emoji : <Smile size={26} />}
                                </div>
                                <strong>Mood Tracker</strong>
                                <small>{mood ? mood.label : 'How are you feeling?'}</small>
                                <Link href="/checkins" className="home-btn">
                                    {mood ? 'Update' : 'Check In'}
                                </Link>
                            </div>
                            <div className="home-life-col">
                                <div className="home-life-icon" aria-hidden="true">
                                    <Calendar size={26} />
                                </div>
                                <strong>Love Calendar</strong>
                                <small>Next date / event</small>
                                <Link href="/calendar" className="home-life-big">
                                    {next_event
                                        ? days === 0
                                            ? 'Today'
                                            : `${days} ${days === 1 ? 'day' : 'days'}`
                                        : 'Add one'}
                                </Link>
                            </div>
                            <div className="home-life-col">
                                <div className="home-life-icon" aria-hidden="true">
                                    <Star size={26} fill="currentColor" />
                                </div>
                                <strong>Bucket List</strong>
                                <small>Dreams together</small>
                                <Link href="/bucket" className="home-life-big">
                                    {bucket ? `${bucket.done} / ${bucket.total}` : 'Open list →'}
                                </Link>
                                {bucket && (
                                    <div className="home-bar thin">
                                        <span style={{ width: `${bucketPct}%` }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Music + reminder */}
                <section className="home-row home-row-b">
                    <div className="home-panel">
                        <div className="home-panel-head">
                            <h2>
                                <Music size={18} aria-hidden="true" /> Currently Playing
                            </h2>
                            <Link href="/music">Open Player →</Link>
                        </div>
                        <div className="home-player">
                            <Link href="/music" className="home-play" aria-label="Open player"><Play size={26} fill="currentColor" /></Link>
                            <Link href="/music" className="home-skip" aria-label="Open player"><SkipForward size={20} fill="currentColor" /></Link>
                            <div className="home-player-text">
                                <strong>{current_song?.title ?? 'A Special Song for You'}</strong>
                                <small>{current_song?.artist ?? 'Our Song'} ♡</small>
                                <div className="home-bar seek"><span style={{ width: '40%' }} /></div>
                            </div>
                            <div className="home-player-tools">
                                <Volume2 size={20} aria-hidden="true" />
                                <ListMusic size={20} aria-hidden="true" />
                            </div>
                        </div>
                    </div>

                    <div className="home-panel home-reminder">
                        <div className="home-panel-head">
                            <h2>
                                <span className="home-heart" aria-hidden="true">♥</span> A Little Reminder
                            </h2>
                        </div>
                        <blockquote>
                            &ldquo;{compliment ?? "You're doing better than you think."}&rdquo;
                        </blockquote>
                        <div className="home-divider" aria-hidden="true">
                            <span>♡</span>
                        </div>
                        <div className="home-reminder-actions">
                            <button type="button" className="olu-linkbtn" onClick={another}>
                                Another one
                            </button>
                            <Link href="/comfort" className="olu-linkbtn">
                                Need comfort?
                            </Link>
                        </div>
                        {/* 👇 paste it here, last child of the panel */}
                        <svg className="home-reminder-sky" viewBox="0 0 100 80" aria-hidden="true">
                            <path d="M60,40 Q62,42 64,42 Q62,42 60,44 Q58,42 56,42 Q58,42 60,40Z" fill="none" />
                            <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                                <path d="M50,12 L53,25 L66,28 L53,31 L50,44 L47,31 L34,28 L47,25Z" />
                                <path d="M78,38 L79.5,44 L86,45.5 L79.5,47 L78,53 L76.5,47 L70,45.5 L76.5,44Z" />
                            </g>
                        </svg>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}