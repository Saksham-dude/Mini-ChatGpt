import React, { useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

interface ComposerProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  isListening?: boolean;
  onToggleListening?: () => void;
  isSpeechSupported?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  input,
  setInput,
  onSend,
  disabled,
  isListening = false,
  onToggleListening,
  isSpeechSupported = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <footer className="p-6 sm:p-8 pt-2 border-t border-[#2b2f3d] bg-[#14161d] shrink-0">
      <div className="relative bg-[#1b1e28] border border-[#2b2f3d] rounded-2xl p-4 flex gap-3 items-center focus-within:border-[#e0a458] group shadow-2xl transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening... Speak now..." : "Ask a question or paste your problem..."}
          rows={1}
          className="bg-transparent flex-grow outline-none resize-none text-[15px] text-[#eef0f4] placeholder-gray-500 leading-relaxed max-h-[160px]"
        />

        {/* Speech Recognition Mic Button */}
        {isSpeechSupported && (
          <button
            type="button"
            onClick={onToggleListening}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              isListening
                ? "bg-red-500/20 text-red-400 border border-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                : "bg-[#232734] text-gray-400 hover:text-[#e0a458] hover:bg-[#2b2f3d] border border-[#2b2f3d]"
            }`}
            title={isListening ? "Listening... Click to stop" : "Start voice input (speech-to-text)"}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        )}

        <button
          onClick={onSend}
          disabled={disabled || !input.trim()}
          aria-label="Send message"
          className="w-10 h-10 bg-[#e0a458] hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-35 rounded-xl flex items-center justify-center text-black font-bold text-xl transition-transform shrink-0 cursor-pointer disabled:cursor-default"
        >
          →
        </button>
      </div>
      <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-[0.2em] select-none font-mono flex items-center justify-center gap-2">
        <span>Enter to send • Shift + Enter for new line</span>
        {isListening && (
          <span className="text-red-400 font-semibold animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
            Listening...
          </span>
        )}
      </p>
    </footer>
  );
};

