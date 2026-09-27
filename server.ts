import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Check Status Endpoint
  app.get("/api/status", (req, res) => {
    const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
    res.json({
      status: "ok",
      hasEnvKey,
      defaultModel: "gemini-3.6-flash"
    });
  });

  // API Chat Endpoint (Supports Streaming & Non-Streaming)
  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message, mode, systemPromptOverride, customApiKey, stream = true } = req.body;

      const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(401).json({
          error: {
            message: "No Gemini API key found. Please configure a key in AI Studio Secrets or enter one in the API Key settings."
          }
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const SYSTEM_PROMPTS: Record<string, string> = {
        general: "You are a versatile, highly intelligent AI assistant. Follow the user's instructions directly. If the user asks you to write, draft, generate, or solve something (like an essay, report, story, or code), fulfill their request completely without withholding text. If the user explicitly asks for ideas, suggestions, outlines, or critique, provide ideas and suggestions.",
        math: "You are a math tutor and problem solver. Walk through problems step by step with clear explanations. If the user asks for direct solutions or calculations, provide the full solution clearly.",
        writing: "You are an expert writer and tutor. ALWAYS follow the user's intent: if the user asks you to write, draft, or compose an essay, paper, story, or article, write the full text completely as requested. Do NOT just give advice or ideas when asked to write the actual piece. If the user asks for outlines, ideas, or feedback, provide ideas and feedback.",
        code: "You are a coding mentor and developer. Help debug, explain, and write code. If asked to write code or complete programs, provide full, working code blocks. Explain key concepts clearly.",
        explain: "You are an academic concept expert. Explain topics clearly with concrete examples and analogies, or write detailed explanations and essays as requested."
      };

      const systemInstruction = systemPromptOverride || SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.general;

      // Construct history contents for Gemini API
      const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const msg of history) {
          formattedContents.push({
            role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
            parts: [{ text: msg.content || msg.text || "" }]
          });
        }
      }

      if (message) {
        formattedContents.push({
          role: "user",
          parts: [{ text: message }]
        });
      }

      const modelName = "gemini-3.6-flash";

      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const responseStream = await ai.models.generateContentStream({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction,
          },
        });

        for await (const chunk of responseStream) {
          const textChunk = chunk.text;
          if (textChunk) {
            res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
          }
        }

        res.write(`data: [DONE]\n\n`);
        res.end();
      } else {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction,
          },
        });

        return res.json({ text: response.text || "" });
      }
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: {
            message: error.message || "An error occurred while calling the Gemini API."
          }
        });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message || "Streaming error" })}\n\n`);
        res.end();
      }
    }
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
