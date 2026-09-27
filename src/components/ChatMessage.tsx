import React from "react";
import { Message } from "../types";
import { FormattedContent } from "./FormattedContent";
import { Volume2, Square, Trash2 } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  onSpeak?: (text: string, id: string) => void;
  isSpeaking?: boolean;
  isTtsSupported?: boolean;
  onDelete?: (id: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSpeak,
  isSpeaking = false,
  isTtsSupported = false,
  onDelete,
}) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-4 ${
        isUser
          ? "self-end max-w-[80%] flex-row-reverse"
          : "self-start max-w-[85%] flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono shrink-0 mt-1 font-bold select-none ${
          isUser
            ? "bg-[#1b1e28] border border-[#2b2f3d] text-gray-400"
            : "bg-[rgba(224,164,88,0.15)] text-[#e0a458]"
        }`}
      >
        {isUser ? "YOU" : "AI"}
      </div>

      {/* Message content & label */}
      <div className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`bg-[#1b1e28] p-4 text-[15px] leading-relaxed text-[#eef0f4] border border-[#2b2f3d] shadow-lg break-words overflow-hidden ${
            isUser
              ? "rounded-2xl rounded-tr-none"
              : "rounded-2xl rounded-tl-none"
          }`}
        >
          <FormattedContent content={message.content} />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
            {isUser ? "YOU" : "STUDY ASSISTANT"}
          </span>

          {!isUser && isTtsSupported && message.content && (
            <button
              onClick={() => onSpeak?.(message.content, message.id)}
              className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 transition-colors cursor-pointer ${
                isSpeaking
                  ? "border-[#e0a458] bg-[#e0a458]/20 text-[#e0a458] animate-pulse"
                  : "border-[#2b2f3d] bg-[#14161d] text-gray-400 hover:text-[#e0a458] hover:border-[#e0a458]/60"
              }`}
              title={isSpeaking ? "Stop speaking" : "Listen to response"}
            >
              {isSpeaking ? (
                <>
                  <Square className="w-2.5 h-2.5 fill-current" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-2.5 h-2.5" />
                  <span>Listen</span>
                </>
              )}
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="text-[10px] px-1.5 py-0.5 rounded border border-[#2b2f3d] bg-[#14161d] text-gray-500 hover:text-red-400 hover:border-red-500/50 transition-colors flex items-center gap-1 cursor-pointer"
              title="Delete message"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

