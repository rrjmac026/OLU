import { useEffect, useState } from 'react';
import { getEcho } from '../lib/echo';
import { api } from '../lib/http';

type Status = { me: number; channel: string | null; unread: boolean };

/** Unread dot (not a count) for the sidebar. */
export default function ChatDot() {
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let channelName: string | null = null;

    const clear = () => setUnread(false);
    const onEvent = (e: { type: string; message?: { sender_id: number } }, me: number) => {
      const onChatPage = window.location.pathname.startsWith('/chat');
      if (e.type === 'sent' && e.message && e.message.sender_id !== me && !onChatPage) {
        setUnread(true);
      }
    };

    window.addEventListener('olu:chat-read', clear);

    let handler: ((e: any) => void) | null = null;

    api<Status>('GET', '/chat/status')
      .then((s) => {
        if (cancelled || !s.channel) return;
        setUnread(s.unread);
        channelName = s.channel;
        handler = (e) => onEvent(e, s.me);
        getEcho().private(s.channel).listen('.chat.updated', handler);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      window.removeEventListener('olu:chat-read', clear);
      if (channelName && handler) {
        getEcho().private(channelName).stopListening('.chat.updated', handler);
      }
    };
  }, []);

  if (!unread) return null;
  return <span className="olu-dot" aria-label="New message" />;
}