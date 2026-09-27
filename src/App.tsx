import React, { useState, useEffect, useRef } from "react";
import { Mode, Message, SUBJECT_MODES } from "./types";
import { Header } from "./components/Header";
import { KeyPanel } from "./components/KeyPanel";
import { ChatMessage } from "./components/ChatMessage";
import { Composer } from "./components/Composer";
import { useSpeech } from "./hooks/useSpeech";
import { Sparkles } from "lucide-react";

const STORAGE_KEY = "mini-chat-session-history";
const API_KEY_STORAGE = "mini-chatgpt-gemini-key";

export default function App() {
  const [currentMode, setCurrentMode] = useState<Mode>("general");
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"ready" | "thinking..." | "error">("ready");
  const [isKeyPanelOpen, setIsKeyPanelOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return localStorage.getItem(API_KEY_STORAGE) || "";
    } catch {
      return "";
    }
  });
  const [hasEnvKey, setHasEnvKey] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);

  const {
    isSpeechSupported,
    isTtsSupported,
    isListening,
    toggleListening,
    speak,
    stopSpeaking,
    speakingMessageId,
    autoSpeak,
    toggleAutoSpeak,
  } = useSpeech({
    onTranscript: (transcript) => {
      setInput(transcript);
    },
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Check server API status on mount
  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        setHasEnvKey(Boolean(data.hasEnvKey));
      })
      .catch((err) => {
        console.error("Status check error:", err);
      });
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  }, [messages]);

  // Save custom key to localStorage
  const handleSaveCustomKey = (key: string) => {
    setCustomApiKey(key);
    try {
      if (key) {
        localStorage.setItem(API_KEY_STORAGE, key);
      } else {
        localStorage.removeItem(API_KEY_STORAGE);
      }
    } catch (e) {
      console.error("Failed to save API key", e);
    }
  };

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleClearChat = () => {
    if (messages.length === 0) return;
    setMessages([]);
    stopSpeaking();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (speakingMessageId === id) {
      stopSpeaking();
    }
  };

  const activeModeDetails = SUBJECT_MODES.find((m) => m.id === currentMode) || SUBJECT_MODES[0];

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || isStreaming) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!overrideText) setInput("");
    setStatus("thinking...");
    setIsStreaming(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    // Add empty assistant message shell for streaming
    setMessages([...newMessages, assistantMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          message: textToSend,
          mode: currentMode,
          customApiKey: customApiKey || undefined,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "Failed to contact Gemini API");
      }

      if (!response.body) {
        throw new Error("No response body received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.substring(6);
            if (dataStr === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: accumulatedText }
                      : m
                  )
                );
              }
            } catch (err) {
              console.error("SSE Parse Error:", err);
            }
          }
        }
      }

      if (!accumulatedText) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: "I didn't get a response back — try again." }
              : m
          )
        );
      } else if (autoSpeak) {
        speak(accumulatedText, assistantMsgId);
      }
      setStatus("ready");
    } catch (err: any) {
      console.error("Chat error:", err);
      setStatus("error");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: `Something went wrong: ${
                  err.message || "Unable to reach API"
                }. Please check your connection or key settings.`,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#14161d] text-[#eef0f4] font-sans overflow-hidden">
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        status={status}
        onClearChat={handleClearChat}
        isKeyPanelOpen={isKeyPanelOpen}
        onToggleKeyPanel={() => setIsKeyPanelOpen(!isKeyPanelOpen)}
        hasCustomKey={Boolean(customApiKey)}
        hasEnvKey={hasEnvKey}
        hasHistory={messages.length > 0}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={toggleAutoSpeak}
        isTtsSupported={isTtsSupported}
      />

      <KeyPanel
        isOpen={isKeyPanelOpen}
        customApiKey={customApiKey}
        onSaveCustomKey={handleSaveCustomKey}
        hasEnvKey={hasEnvKey}
      />

      {/* Main Chat Stream Container */}
      <main
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-8 scrollbar-thin scrollbar-thumb-[#2b2f3d]"
      >
        {messages.length === 0 ? (
          <div className="my-auto max-w-lg mx-auto text-center py-10 px-4 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(224,164,88,0.15)] text-[#e0a458] border border-[#2b2f3d] flex items-center justify-center mx-auto text-2xl shadow-[0_0_20px_rgba(224,164,88,0.15)]">
              ✎
            </div>
            
            <div className="space-y-2">
              <h2 className="font-serif text-xl font-semibold text-[#eef0f4]">
                Welcome to Mini ChatGPT
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
                Paste an assignment, ask a question, or describe what you're stuck on. Pick a mode above to tune how I respond.
              </p>
            </div>

            {/* Mode Suggestion Chips */}
            <div className="space-y-3 pt-2 text-left">
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 text-center">
                SUGGESTED FOR {activeModeDetails.label.toUpperCase()}
              </div>
              <div className="grid gap-2">
                {activeModeDetails.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="p-4 bg-[#1b1e28] hover:bg-[#232734] border border-[#2b2f3d] hover:border-[#e0a458]/60 rounded-2xl text-xs sm:text-sm text-[#eef0f4] text-left transition-all flex items-center justify-between group cursor-pointer shadow-lg"
                  >
                    <span>{suggestion}</span>
                    <Sparkles className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#e0a458] shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onSpeak={speak}
              isSpeaking={speakingMessageId === msg.id}
              isTtsSupported={isTtsSupported}
              onDelete={handleDeleteMessage}
            />
          ))
        )}

        {/* Typing indicator when assistant message shell is created but empty */}
        {isStreaming &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "assistant" &&
          messages[messages.length - 1].content === "" && (
            <div className="flex gap-4 self-start max-w-[85%]">
              <div className="w-8 h-8 rounded-lg bg-[rgba(224,164,88,0.15)] flex items-center justify-center text-[10px] font-mono text-[#e0a458] shrink-0 mt-1 font-bold select-none">
                AI
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="bg-[#1b1e28] p-4 rounded-2xl rounded-tl-none border border-[#2b2f3d] shadow-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse [animation-delay:0.4s]" />
                </div>
                <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                  STUDY ASSISTANT
                </div>
              </div>
            </div>
          )}

        <div ref={chatEndRef} />
      </main>

      <Composer
        input={input}
        setInput={setInput}
        onSend={() => handleSend()}
        disabled={isStreaming}
        isListening={isListening}
        onToggleListening={toggleListening}
        isSpeechSupported={isSpeechSupported}
      />
    </div>
  );
}
