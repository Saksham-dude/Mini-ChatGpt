import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border border-[#2b2f3d] bg-[#0f1117] font-mono text-[13px]">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#171a24] border-b border-[#2b2f3d] text-[#8b93a7] text-xs">
        <span className="uppercase tracking-wider text-[11px] font-medium text-[#5f6678]">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-[#8b93a7] hover:text-[#e0a458] hover:bg-[#232734] transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto m-0 leading-relaxed text-[#eef0f4]">
        <code>{code}</code>
      </pre>
    </div>
  );
};
