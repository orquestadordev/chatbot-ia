import { ChatContainer } from "./components/ChatContainer";
import { ChatInput } from "./components/ChatInput";
import { ConnectionBadge } from './components/ConnectionBadge';
import { MessageList } from "./components/MessageList";
import { TypingIndicator } from "./components/TypingIndicator";
import { useChatSession } from "./hooks/useChatSession";

const App = () => {
  const { messages, sendMessage, cancelStream, resetConversation, isStreaming, error, connectionState } = useChatSession();

  const badgeState = error ? "error" : isStreaming || connectionState === "connecting" ? "responding" : "ready";
  const badgeLabel = {
    ready: "Disponible",
    responding: "Respondiendo…",
    error: "Reintentando…"
  }[badgeState];

  return (
    <main className="app-layout">
      <ChatContainer
        subtitle="Asistente conversacional local"
        actions={
          <div className="chat-header-actions">
            <ConnectionBadge state={badgeState} label={badgeLabel} />
            <button className="btn btn-ghost" onClick={resetConversation} disabled={messages.length <= 1 && !isStreaming}>
              Reiniciar
            </button>
          </div>
        }
      >
        <MessageList messages={messages} />
        {error ? <div className="chat-error-banner">{error}</div> : null}
        <TypingIndicator active={isStreaming} />
        <ChatInput onSend={sendMessage} disabled={isStreaming} isStreaming={isStreaming} onStop={cancelStream} />
      </ChatContainer>
    </main>
  );
};

export default App;
