import { useChatUnread } from '../hooks/use-chat-unread';

/** Unread dot (not a count) for the sidebar. */
export default function ChatDot() {
  const unread = useChatUnread();
  if (!unread) return null;
  return <span className="olu-dot" aria-label="New message" />;
}