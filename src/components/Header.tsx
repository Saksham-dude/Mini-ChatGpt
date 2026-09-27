import React from "react";
import { Mode, SUBJECT_MODES } from "../types";
import { Key, Trash2, Sparkles, Volume2, VolumeX } from "lucide-react";

interface HeaderProps {
  currentMode: Mode;
  onSelectMode: (mode: Mode) => void;
  status: "ready" | "thinking..." | "error";
  onClearChat: () => void;
  isKeyPanelOpen: boolean;
  onToggleKeyPanel: () => void;
  hasCustomKey: boolean;
  hasEnvKey: boolean;
  hasHistory: boolean;
  autoSpeak?: boolean;
  onToggleAutoSpeak?: () => void;
  isTtsSupported?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  status,
  onClearChat,
  onToggleKeyPanel,
  hasCustomKey,
  hasEnvKey,
  hasHistory,
  autoSpeak = false,
  onToggleAutoSpeak,
  isTtsSupported = false,
}) => {
  const isKeyActive = hasCustomKey || hasEnvKey;

  return (
    <header className="p-6 pb-4 border-b border-[#2b2f3d] bg-[#14161d] shrink-0 sticky top-0 z-10">
      <div className="flex justify-between items-baseline mb-4">
        <h1 className="font-serif font-semibold text-2xl tracking-wide text-[#eef0f4]">
          Mini ChatGPT
        </h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`font-mono text-[10px] uppercase tracking-wider transition-colors ${
              status === "thinking..."
                ? "text-[#e0a458] animate-pulse"
                : status === "error"
                ? "text-red-400"
                : "opacity-50 text-[#8b93a7]"
            }`}
          >
            System: {status}
          </span>

          {isTtsSupported && (
            <button
              onClick={onToggleAutoSpeak}
              className={`text-xs py-1.5 px-2.5 rounded-lg border transition-colors flex items-center gap-1 font-medium cursor-pointer ${
                autoSpeak
                  ? "border-[#e0a458] bg-[#e0a458]/15 text-[#e0a458]"
                  : "border-[#2b2f3d] bg-[#1b1e28] text-gray-400 hover:border-[#e0a458]/60 hover:text-[#eef0f4]"
              }`}
              title={autoSpeak ? "Auto-voice: ON (Read AI responses)" : "Auto-voice: OFF"}
            >
              {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{autoSpeak ? "Voice ON" : "Voice OFF"}</span>
            </button>
          )}

          <button
            onClick={onToggleKeyPanel}
            className={`text-xs py-1.5 px-3 rounded-lg border transition-colors flex items-center gap-1.5 font-medium ${
              isKeyActive
                ? "border-[#2b2f3d] bg-[#1b1e28] text-gray-400 hover:border-[#e0a458] hover:text-[#e0a458]"
                : "border-[#e0a458] bg-[#e0a458]/10 text-[#e0a458]"
            }`}
            title="Configure API key"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isKeyActive ? "API Key ✓" : "Add API key"}</span>
          </button>

          <button
            onClick={onClearChat}
            disabled={!hasHistory}
            className={`text-xs py-1.5 px-3 rounded-lg border transition-colors flex items-center gap-1.5 ${
              hasHistory
                ? "border-[#2b2f3d] bg-[#1b1e28] text-gray-400 hover:border-red-500 hover:text-red-400"
                : "border-[#2b2f3d]/50 bg-[#1b1e28]/50 text-gray-600 cursor-not-allowed opacity-50"
            }`}
            title="Delete chat history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      <div className="h-[2px] w-14 bg-[#e0a458] rounded-full shadow-[0_0_8px_rgba(224,164,88,0.4)] mb-4" />

      {/* Subject Mode Pills */}
      <div className="flex gap-2 flex-wrap">
        {SUBJECT_MODES.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`text-xs py-1.5 px-4 rounded-full border transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "border-[#e0a458] bg-[rgba(224,164,88,0.1)] text-[#e0a458]"
                  : "border-[#2b2f3d] bg-[#1b1e28] text-gray-400 hover:border-[#e0a458]/60 hover:text-[#eef0f4]"
              }`}
            >
              {isActive && <Sparkles className="w-3 h-3 text-[#e0a458]" />}
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

