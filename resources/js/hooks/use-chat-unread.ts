import { useEffect, useState } from 'react';
import { getEcho } from '../lib/echo';
import { api } from '../lib/http';

type Status = { me: number; channel: string | null; unread: boolean };
type ChatPayload = { type: string; message?: { sender_id: number } };

/** True when there is an unread chat message. Shared by the sidebar dot and the floating bubble. */
export function useChatUnread(): boolean {
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let channelName: string | null = null;
    let handler: ((e: ChatPayload) => void) | null = null;

    const clear = () => setUnread(false);
    window.addEventListener('olu:chat-read', clear);

    api<Status>('GET', '/chat/status')
      .then((s) => {
        if (cancelled || !s.channel) return;
        setUnread(s.unread);
        channelName = s.channel;
        handler = (e) => {
          const onChatPage = window.location.pathname.startsWith('/chat');
          if (e.type === 'sent' && e.message && e.message.sender_id !== s.me && !onChatPage) {
            setUnread(true);
          }
        };
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

  return unread;
}