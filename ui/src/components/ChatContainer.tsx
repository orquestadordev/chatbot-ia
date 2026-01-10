import { ReactNode } from "react";

interface ChatContainerProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export const ChatContainer = ({ title = "AndesGPT", subtitle = "Chat local con SSE", children, actions }: ChatContainerProps) => {
  return (
    <div className="chat-shell">
      <header className="chat-header">
        <div>
          <p className="chat-title">{title}</p>
          <p className="chat-subtitle">{subtitle}</p>
        </div>
        {actions ? <div className="chat-actions">{actions}</div> : null}
      </header>
      <div className="chat-body">{children}</div>
    </div>
  );
};
