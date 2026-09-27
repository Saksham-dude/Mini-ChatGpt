import React from "react";
import { CodeBlock } from "./CodeBlock";

interface FormattedContentProps {
  content: string;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({ content }) => {
  if (!content) return null;

  // Split by code blocks ```...```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-[15px] leading-[1.6]">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Extract language and code
          const raw = part.slice(3, -3);
          const firstLineEnd = raw.indexOf("\n");
          let language = "";
          let code = raw;

          if (firstLineEnd !== -1) {
            const possibleLang = raw.substring(0, firstLineEnd).trim();
            if (possibleLang && !possibleLang.includes(" ")) {
              language = possibleLang;
              code = raw.substring(firstLineEnd + 1);
            }
          }

          return <CodeBlock key={index} code={code} language={language} />;
        } else {
          // Render formatted text with inline formatting
          return <TextSegment key={index} text={part} />;
        }
      })}
    </div>
  );
};

const TextSegment: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Process lines for lists or paragraphs
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = (keyPrefix: number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${keyPrefix}`} className="list-disc list-inside space-y-1 my-1 pl-1">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    
    // Bullet list item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const itemText = trimmed.substring(2);
      currentList.push(
        <li key={i} className="text-[#eef0f4]">
          {renderInlineFormatting(itemText)}
        </li>
      );
      return;
    }

    // Numbered list item e.g. "1. "
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      flushList(i);
      elements.push(
        <div key={i} className="flex gap-2 my-1">
          <span className="font-mono text-[#e0a458] text-xs font-semibold">{numMatch[1]}.</span>
          <span>{renderInlineFormatting(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Header 1 / 2 / 3
    if (trimmed.startsWith("### ")) {
      flushList(i);
      elements.push(
        <h3 key={i} className="font-serif text-lg font-semibold text-[#eef0f4] mt-3 mb-1">
          {renderInlineFormatting(trimmed.substring(4))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      flushList(i);
      elements.push(
        <h2 key={i} className="font-serif text-xl font-semibold text-[#eef0f4] mt-4 mb-1 border-b border-[#2b2f3d] pb-1">
          {renderInlineFormatting(trimmed.substring(3))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith("# ")) {
      flushList(i);
      elements.push(
        <h1 key={i} className="font-serif text-2xl font-bold text-[#eef0f4] mt-4 mb-2">
          {renderInlineFormatting(trimmed.substring(2))}
        </h1>
      );
      return;
    }

    flushList(i);

    if (line === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="my-0.5 whitespace-pre-wrap">
          {renderInlineFormatting(line)}
        </p>
      );
    }
  });

  flushList(lines.length);

  return <>{elements}</>;
};

function renderInlineFormatting(text: string): React.ReactNode {
  // Regex to match inline code, bold, italic
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={idx}
          className="font-mono text-[13px] bg-[#232734] text-[#e0a458] px-1.5 py-0.5 rounded border border-[#2b2f3d]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-[#eef0f4]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return (
        <em key={idx} className="italic text-[#8b93a7]">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}
