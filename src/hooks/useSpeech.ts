import { useState, useEffect, useCallback, useRef } from "react";
import { cleanTextForSpeech } from "../utils/speech";

interface UseSpeechOptions {
  onTranscript?: (transcript: string) => void;
}

export function useSpeech(options?: UseSpeechOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isTtsSupported, setIsTtsSupported] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    try {
      return localStorage.getItem("mini-chatgpt-auto-speak") === "true";
    } catch {
      return false;
    }
  });

  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(options?.onTranscript);

  useEffect(() => {
    onTranscriptRef.current = options?.onTranscript;
  }, [options?.onTranscript]);

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      setIsSpeechSupported(true);
      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (onTranscriptRef.current && currentTranscript) {
            onTranscriptRef.current(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.error("Failed to initialize Speech Recognition:", e);
      }
    }

    // Check Speech Synthesis support
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsTtsSupported(true);
    }
  }, []);

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("mini-chatgpt-auto-speak", String(next));
      } catch {}
      if (!next && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
      }
      return next;
    });
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) {
        console.error("Failed to stop speech recognition:", e);
      }
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  }, []);

  const speak = useCallback(
    (text: string, messageId: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      // If currently speaking this message, toggle stop
      if (speakingMessageId === messageId) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
        return;
      }

      window.speechSynthesis.cancel();

      const cleanText = cleanTextForSpeech(text);
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setSpeakingMessageId(null);
      };

      utterance.onerror = () => {
        setSpeakingMessageId(null);
      };

      setSpeakingMessageId(messageId);
      window.speechSynthesis.speak(utterance);
    },
    [speakingMessageId]
  );

  return {
    isSpeechSupported,
    isTtsSupported,
    isListening,
    toggleListening,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    speakingMessageId,
    autoSpeak,
    toggleAutoSpeak,
  };
}
