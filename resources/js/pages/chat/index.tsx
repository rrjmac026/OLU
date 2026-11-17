import { ArrowDown, Check, CheckCheck, EyeOff, Heart, Pencil, Send, Smile, Undo2, X } from 'lucide-react';
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import AppLayout from '../../layouts/app-layout';
import { getEcho } from '../../lib/echo';
import { api } from '../../lib/http';
// 👇 NEW: adjust the path to where you put chat.css
import '../../../css/chat.css';

type Msg = {
  id: number;
  sender_id: number;
  body: string;
  unsent: boolean;
  edited: boolean;
  created_at: string;
  read_at: string | null;
};

type Props = {
  meId: number;
  partner: { id: number; name: string } | null;
  channel: string | null;
  messages: Msg[];
  hasMore: boolean;
};

type ChatEvent =
  | { type: 'sent' | 'edited' | 'unsent'; message: Msg }
  | { type: 'read'; reader_id: number; read_at: string };

const GROUP_GAP_MS = 5 * 60 * 1000;

const EMOJIS = [
  '😊', '😍', '🥰', '😘', '😂', '🥺', '😭', '😴',
  '🤗', '😎', '🙈', '💗', '💖', '💕', '💞', '✨',
  '🌸', '🌙', '⭐', '🎀', '🐱', '🍓', '☕', '🔥',
];

const STARTERS = ['Hi ♡', 'Miss you 🥺', 'Good morning ☀️'];

function upsert(list: Msg[], msg: Msg): Msg[] {
  const i = list.findIndex((m) => m.id === msg.id);
  if (i >= 0) {
    const copy = list.slice();
    copy[i] = msg;
    return copy;
  }
  return [...list, msg].sort((a, b) => a.id - b.id);
}

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function ChatBody({ meId, partner, channel, messages: initial, hasMore: initialHasMore }: Props) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [newCount, setNewCount] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const prevHeight = useRef<number | null>(null);
  const typingTimer = useRef<number | undefined>(undefined);
  const lastWhisper = useRef(0);
  const known = useRef<Set<number>>(new Set(initial.map((m) => m.id)));

  const markRead = useCallback(() => {
    api('POST', '/chat/read')
      .then(() => window.dispatchEvent(new Event('olu:chat-read')))
      .catch(() => {});
  }, []);

  // remember which messages already rendered, so only new ones animate in
  useEffect(() => {
    messages.forEach((m) => known.current.add(m.id));
  }, [messages]);

  // clear the sidebar dot (server already marked everything read on page load)
  useEffect(() => {
    window.dispatchEvent(new Event('olu:chat-read'));
  }, []);

  // realtime
  useEffect(() => {
    if (!channel) return;
    const ch = getEcho().private(channel);

    const onEvent = (e: ChatEvent) => {
      if (e.type === 'read') {
        if (e.reader_id !== meId) {
          setMessages((prev) =>
            prev.map((m) => (m.sender_id === meId && !m.read_at ? { ...m, read_at: e.read_at } : m)),
          );
        }
        return;
      }
      setMessages((prev) => upsert(prev, e.message));
      if (e.type === 'sent' && e.message.sender_id !== meId) {
        setPartnerTyping(false);
        if (!stick.current) setNewCount((c) => c + 1);
        markRead();
      }
    };

    const onTyping = () => {
      setPartnerTyping(true);
      window.clearTimeout(typingTimer.current);
      typingTimer.current = window.setTimeout(() => setPartnerTyping(false), 2500);
    };

    ch.listen('.chat.updated', onEvent);
    ch.listenForWhisper('typing', onTyping);

    return () => {
      ch.stopListening('.chat.updated', onEvent);
      ch.stopListeningForWhisper('typing', onTyping);
      window.clearTimeout(typingTimer.current);
    };
  }, [channel, meId, markRead]);

  // scrolling: stay at the bottom unless she scrolled up; keep position when loading older
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (prevHeight.current !== null) {
      el.scrollTop = el.scrollHeight - prevHeight.current;
      prevHeight.current = null;
    } else if (stick.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, partnerTyping]);

  // composer grows with the text (up to ~5 lines)
  useLayoutEffect(() => {
    const t = taRef.current;
    if (!t) return;
    t.style.height = 'auto';
    t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
  }, [draft]);

  // close the emoji picker on outside click / Escape
  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setEmojiOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setEmojiOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [emojiOpen]);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    stick.current = dist < 80;
    setShowJump(dist > 240);
    if (dist < 80) setNewCount(0);
  }

  function jumpToLatest() {
    const el = listRef.current;
    if (!el) return;
    stick.current = true;
    setNewCount(0);
    setShowJump(false);
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }

  async function loadOlder() {
    const first = messages[0];
    if (!first) return;
    try {
      const res = await api<{ messages: Msg[]; hasMore: boolean }>('GET', `/chat/messages?before=${first.id}`);
      res.messages.forEach((m) => known.current.add(m.id));
      prevHeight.current = listRef.current?.scrollHeight ?? null;
      setMessages((prev) => [...res.messages, ...prev]);
      setHasMore(res.hasMore);
    } catch {
      setError('Could not load older messages.');
    }
  }

  function onDraftChange(value: string) {
    setDraft(value);
    if (channel && Date.now() - lastWhisper.current > 1500) {
      lastWhisper.current = Date.now();
      getEcho().private(channel).whisper('typing', {});
    }
  }

  function addEmoji(emoji: string) {
    const t = taRef.current;
    const start = t?.selectionStart ?? draft.length;
    const end = t?.selectionEnd ?? draft.length;
    const next = (draft.slice(0, start) + emoji + draft.slice(end)).slice(0, 2000);
    onDraftChange(next);
    requestAnimationFrame(() => {
      t?.focus();
      const pos = start + emoji.length;
      t?.setSelectionRange(pos, pos);
    });
  }

  function useStarter(text: string) {
    onDraftChange(text);
    requestAnimationFrame(() => taRef.current?.focus());
  }

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setError(null);
    setEmojiOpen(false);
    stick.current = true;
    try {
      if (editingId) {
        const m = await api<Msg>('PATCH', `/chat/messages/${editingId}`, { body });
        setMessages((prev) => upsert(prev, m));
        setEditingId(null);
      } else {
        const m = await api<Msg>('POST', '/chat/messages', { body });
        setMessages((prev) => upsert(prev, m));
      }
      setDraft('');
    } catch {
      setError('Could not send that. Try again?');
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  function startEdit(m: Msg) {
    setEditingId(m.id);
    setDraft(m.body);
    setActiveId(null);
    requestAnimationFrame(() => taRef.current?.focus());
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft('');
  }

  async function unsend(m: Msg) {
    setActiveId(null);
    if (!window.confirm('Unsend this message for both of you?')) return;
    try {
      const updated = await api<Msg>('DELETE', `/chat/messages/${m.id}`);
      setMessages((prev) => upsert(prev, updated));
    } catch {
      setError('Could not unsend that.');
    }
  }

  async function removeForMe(m: Msg) {
    setActiveId(null);
    if (!window.confirm('Remove this message from your view? They will still see it.')) return;
    try {
      await api('POST', `/chat/messages/${m.id}/remove`);
      setMessages((prev) => prev.filter((x) => x.id !== m.id));
    } catch {
      setError('Could not remove that.');
    }
  }

  if (!partner || !channel) {
    return (
      <div className="olu-card">
        <h1>Chat</h1>
        <p>Your person has not joined yet. Once their account exists, you can chat here.</p>
      </div>
    );
  }

  const lastMineId = [...messages].reverse().find((m) => m.sender_id === meId && !m.unsent)?.id;
  const initialLetter = partner.name.charAt(0).toUpperCase();

  return (
    <div className="ch">
      <div className="ch-head">
        <span className="ch-avatar">{initialLetter}</span>
        <div className="ch-who">
          <strong>{partner.name}</strong>
          <small>
            {partnerTyping ? (
              <span className="ch-typing-text" aria-live="polite">
                typing<i /><i /><i />
              </span>
            ) : (
              'Our little chat ♡'
            )}
          </small>
        </div>
        <Heart className="ch-head-heart" size={20} aria-hidden="true" />
      </div>

      <div
        className="ch-list"
        ref={listRef}
        onScroll={onScroll}
        onClick={(e) => {
          if (e.target === e.currentTarget) setActiveId(null);
        }}
      >
        {hasMore && (
          <button type="button" className="ch-older" onClick={loadOlder}>
            Load older messages
          </button>
        )}

        {messages.length === 0 && (
          <div className="ch-empty">
            <span className="ch-empty-emoji" aria-hidden="true">👋</span>
            <strong>Say hi to {partner.name}</strong>
            <small>No pressure. Start with something small ♡</small>
            <div className="ch-chips">
              {STARTERS.map((s) => (
                <button key={s} type="button" onClick={() => useStarter(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const mine = m.sender_id === meId;
          const open = activeId === m.id;

          const newDay = !prev || new Date(prev.created_at).toDateString() !== new Date(m.created_at).toDateString();
          const first =
            newDay ||
            prev.sender_id !== m.sender_id ||
            new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() > GROUP_GAP_MS;
          const last =
            !next ||
            next.sender_id !== m.sender_id ||
            new Date(next.created_at).toDateString() !== new Date(m.created_at).toDateString() ||
            new Date(next.created_at).getTime() - new Date(m.created_at).getTime() > GROUP_GAP_MS;
          const fresh = !known.current.has(m.id);

          return (
            <Fragment key={m.id}>
              {newDay && (
                <div className="ch-day">
                  <span>{dayLabel(m.created_at)}</span>
                </div>
              )}

              <div
                className={`ch-row ${mine ? 'mine' : 'theirs'}${first ? ' first' : ''}${last ? ' last' : ''}${fresh ? ' fresh' : ''}${open ? ' open' : ''}`}
              >
                <div className="ch-line">
                  {!mine && (last ? <span className="ch-avatar-sm">{initialLetter}</span> : <span className="ch-avatar-gap" />)}

                  {m.unsent ? (
                    <div className="ch-bubble unsent">{mine ? 'You unsent a message' : 'Message unsent'}</div>
                  ) : (
                    <button
                      type="button"
                      className="ch-bubble"
                      title={time(m.created_at)}
                      onClick={() => setActiveId(open ? null : m.id)}
                      aria-expanded={open}
                    >
                      {m.body}
                    </button>
                  )}
                </div>

                {open && !m.unsent && (
                  <div className="ch-actions">
                    {mine && (
                      <button type="button" onClick={() => startEdit(m)}>
                        <Pencil size={14} aria-hidden="true" /> Edit
                      </button>
                    )}
                    {mine && (
                      <button type="button" className="danger" onClick={() => unsend(m)}>
                        <Undo2 size={14} aria-hidden="true" /> Unsend
                      </button>
                    )}
                    <button type="button" onClick={() => removeForMe(m)}>
                      <EyeOff size={14} aria-hidden="true" /> Remove for me
                    </button>
                  </div>
                )}

                {last && (
                  <div className="ch-meta">
                    {time(m.created_at)}
                    {m.edited && !m.unsent ? ' · edited' : ''}
                    {mine && m.id === lastMineId && (
                      <span className={`ch-status${m.read_at ? ' seen' : ''}`}>
                        {m.read_at ? <CheckCheck size={14} aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}
                        {m.read_at ? 'Seen' : 'Sent'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}

        {partnerTyping && (
          <div className="ch-row theirs first last">
            <div className="ch-line">
              <span className="ch-avatar-sm">{initialLetter}</span>
              <div className="ch-bubble ch-typing-bubble" aria-hidden="true">
                <i /><i /><i />
              </div>
            </div>
          </div>
        )}
      </div>

      {showJump && (
        <button type="button" className="ch-jump" onClick={jumpToLatest} aria-label="Jump to latest message">
          <ArrowDown size={18} aria-hidden="true" />
          {newCount > 0 && <span className="ch-jump-count">{newCount}</span>}
        </button>
      )}

      {error && <p className="ch-error" role="alert">{error}</p>}

      <form className="ch-composer" onSubmit={send}>
        {editingId && (
          <div className="ch-editing">
            <Pencil size={14} aria-hidden="true" />
            <span>Editing message</span>
            <button type="button" onClick={cancelEdit} aria-label="Cancel editing">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="ch-box">
          <div className="ch-emoji-wrap" ref={emojiRef}>
            <button
              type="button"
              className={`ch-icon-btn${emojiOpen ? ' on' : ''}`}
              aria-label="Emoji"
              aria-expanded={emojiOpen}
              onClick={() => setEmojiOpen((v) => !v)}
            >
              <Smile size={20} />
            </button>
            {emojiOpen && (
              <div className="ch-emoji-pop" role="menu">
                {EMOJIS.map((em) => (
                  <button key={em} type="button" onClick={() => addEmoji(em)}>
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea
            ref={taRef}
            rows={1}
            value={draft}
            maxLength={2000}
            placeholder={editingId ? 'Edit your message…' : 'Write something…'}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={onKeyDown}
          />

          {draft.length > 1800 && <span className="ch-count">{2000 - draft.length}</span>}

          <button type="submit" className="ch-send" disabled={sending || !draft.trim()} aria-label={editingId ? 'Save' : 'Send'}>
            {editingId ? <Check size={18} /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ChatIndex(props: Props) {
  return (
    <AppLayout title="Chat">
      <ChatBody {...props} />
    </AppLayout>
  );
}