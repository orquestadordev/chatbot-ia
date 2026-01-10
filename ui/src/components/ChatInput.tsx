import { ChangeEvent, FormEvent, KeyboardEvent, useState } from "react";
import clsx from "clsx";

interface ChatInputProps {
  onSend: (message: string) => void | Promise<void>;
  disabled?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
}

export const ChatInput = ({ onSend, disabled, isStreaming, onStop }: ChatInputProps) => {
  const [value, setValue] = useState("");

  const submitMessage = async () => {
    if (!value.trim() || disabled) {
      return;
    }
    await onSend(value);
    setValue("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <textarea
        className="chat-input__textarea"
        placeholder="Escribí tu mensaje y presioná Enter"
        value={value}
        disabled={disabled}
  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
      />
      <div className="chat-input__actions">
        {isStreaming ? (
          <button type="button" className="btn btn-secondary" onClick={onStop}>
            Detener
          </button>
        ) : null}
        <button type="submit" className={clsx("btn", "btn-primary")} disabled={disabled || !value.trim()}>
          Enviar
        </button>
      </div>
    </form>
  );
};
