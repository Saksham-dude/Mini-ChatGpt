import React, { useState } from "react";
import { Check, Info, ShieldCheck } from "lucide-react";

interface KeyPanelProps {
  isOpen: boolean;
  customApiKey: string;
  onSaveCustomKey: (key: string) => void;
  hasEnvKey: boolean;
}

export const KeyPanel: React.FC<KeyPanelProps> = ({
  isOpen,
  customApiKey,
  onSaveCustomKey,
  hasEnvKey,
}) => {
  const [inputValue, setInputValue] = useState(customApiKey);
  const [justSaved, setJustSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveCustomKey(inputValue.trim());
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="mx-6 mt-3 p-4 bg-[#1b1e28] border border-[#2b2f3d] rounded-xl space-y-3 text-xs leading-relaxed text-[#8b93a7]">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-[#e0a458] shrink-0 mt-0.5" />
        <div>
          <p className="text-[#eef0f4] font-medium mb-1">
            Gemini API Key Setup
          </p>
          <p>
            This application runs securely server-side using Google's Gemini API (
            <code className="text-[#e0a458] font-mono">gemini-3.6-flash</code>).
            {hasEnvKey ? (
              <span className="text-emerald-400 font-medium ml-1 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 inline" /> AI Studio environment key is active!
              </span>
            ) : (
              <span>
                You can get a free key at{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e0a458] underline hover:text-amber-300"
                >
                  aistudio.google.com/apikey
                </a>{" "}
                and paste it below if needed.
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="password"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={hasEnvKey ? "Using automatic AI Studio key (optional override)" : "Paste Gemini API key here..."}
          className="flex-1 bg-[#232734] border border-[#2b2f3d] rounded-lg px-3 py-2 text-[#eef0f4] font-mono text-xs focus:outline-none focus:border-[#e0a458]"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <button
          onClick={handleSave}
          className="bg-[#e0a458] hover:bg-[#ebd095] text-[#241705] font-semibold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1 shrink-0"
        >
          {justSaved ? (
            <>
              <Check className="w-3.5 h-3.5" /> Saved
            </>
          ) : (
            "Save Key"
          )}
        </button>
      </div>
    </div>
  );
};
