import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import AppLayout from '../../layouts/app-layout';
import { getEcho } from '../../lib/echo';
import { api } from '../../lib/http';

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

function ChatBody({ meId, partner, channel, messages: initial, hasMore: initialHasMore }: Props) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const prevHeight = useRef<number | null>(null);
  const typingTimer = useRef<number | undefined>(undefined);
  const lastWhisper = useRef(0);

  const markRead = useCallback(() => {
    api('POST', '/chat/read')
      .then(() => window.dispatchEvent(new Event('olu:chat-read')))
      .catch(() => {});
  }, []);

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

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  async function loadOlder() {
    const first = messages[0];
    if (!first) return;
    try {
      const res = await api<{ messages: Msg[]; hasMore: boolean }>('GET', `/chat/messages?before=${first.id}`);
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

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setError(null);
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

  return (
    <div className="olu-chat">
      <div className="olu-chat-head">
        <span className="olu-chat-avatar">{partner.name.charAt(0).toUpperCase()}</span>
        <div className="olu-chat-who">
          <strong>{partner.name}</strong>
          <small>
            {partnerTyping ? (
              <span className="olu-typing" aria-live="polite">typing<i /><i /><i /></span>
            ) : (
              'Our little chat ♡'
            )}
          </small>
        </div>
      </div>

      <div className="olu-chat-list" ref={listRef} onScroll={onScroll}>
        {hasMore && (
          <button type="button" className="olu-chat-older" onClick={loadOlder}>
            Load older messages
          </button>
        )}

        {messages.length === 0 && <p className="olu-chat-empty">Say hi. No pressure.</p>}

        {messages.map((m) => {
          const mine = m.sender_id === meId;
          const open = activeId === m.id;
          return (
            <div key={m.id} className={`olu-bubble-row ${mine ? 'mine' : 'theirs'}`}>
              {m.unsent ? (
                <div className="olu-bubble unsent">{mine ? 'You unsent a message' : 'Message unsent'}</div>
              ) : (
                <button
                  type="button"
                  className="olu-bubble"
                  onClick={() => setActiveId(open ? null : m.id)}
                  aria-expanded={open}
                >
                  {m.body}
                </button>
              )}

              {open && !m.unsent && (
                <div className="olu-bubble-actions">
                  {mine && <button type="button" onClick={() => startEdit(m)}>Edit</button>}
                  {mine && <button type="button" onClick={() => unsend(m)}>Unsend</button>}
                  <button type="button" onClick={() => removeForMe(m)}>Remove for me</button>
                </div>
              )}

              <div className="olu-meta">
                {time(m.created_at)}
                {m.edited && !m.unsent ? ' · edited' : ''}
                {mine && m.id === lastMineId ? (m.read_at ? ' · Seen' : ' · Sent') : ''}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="olu-chat-error" role="alert">{error}</p>}

      <form className="olu-chat-composer" onSubmit={send}>
        <textarea
          rows={1}
          value={draft}
          maxLength={2000}
          placeholder={editingId ? 'Edit your message…' : 'Write something…'}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {editingId && (
          <button type="button" className="olu-btn" onClick={cancelEdit}>Cancel</button>
        )}
        <button type="submit" className="olu-btn" disabled={sending || !draft.trim()}>
          {editingId ? 'Save' : 'Send'}
        </button>
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
