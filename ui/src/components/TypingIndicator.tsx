interface TypingIndicatorProps {
  active: boolean;
}

export const TypingIndicator = ({ active }: TypingIndicatorProps) => {
  if (!active) {
    return null;
  }

  return (
    <div className="typing-indicator" role="status" aria-live="polite">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
      <p>AndesGPT está pensando…</p>
    </div>
  );
};
