import { ChatContainer } from "./components/ChatContainer";
import { ChatInput } from "./components/ChatInput";
import { MessageList } from "./components/MessageList";
import { TypingIndicator } from "./components/TypingIndicator";
import { useChatSession } from "./hooks/useChatSession";

const App = () => {
  const { messages, sendMessage, cancelStream, resetConversation, isStreaming, error } = useChatSession();

  return (
    <main className="app-layout">
      <ChatContainer
        actions={
          <button className="btn btn-ghost" onClick={resetConversation} disabled={!messages.length && !isStreaming}>
            Reiniciar
          </button>
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
