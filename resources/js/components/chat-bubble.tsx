import { Link, usePage } from '@inertiajs/react';
import { useChatUnread } from '../hooks/use-chat-unread';

export default function ChatBubble() {
  const { url } = usePage();
  const unread = useChatUnread();

  // already on the chat page, no need for the bubble
  if (url.startsWith('/chat')) return null;

  return (
    <Link href="/chat" className="olu-fab" aria-label={unread ? 'Open chat (new message)' : 'Open chat'}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-4.3 3.6A.5.5 0 0 1 3 21V5a2 2 0 0 1 1-2z" />
      </svg>
      {unread && <span className="olu-fab-dot" />}
    </Link>
  );
}