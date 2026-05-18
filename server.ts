import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Gemini Initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI endpoints
app.post("/api/ai/recommendations", async (req, res) => {
  try {
    const { userProfile, otherProfiles } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a dating expert. Based on the following user profile and a list of candidates, rank the candidates by compatibility percentage and provide a brief reasoning for each.
      
      User Profile: ${JSON.stringify(userProfile)}
      Candidates: ${JSON.stringify(otherProfiles)}
      
      Return a JSON array of objects: { uid: string, matchPercentage: number, reasoning: string }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/chat-assistant", async (req, res) => {
  try {
    const { message, context } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an AI Wingman dating assistant for the app "not alone". Your goal is to help the user send amazing first messages (icebreakers) or keep the conversation flowing.
      
      Current Match Profile: ${JSON.stringify(context.matchProfile)}
      Recent Chat History: ${JSON.stringify(context.lastMessages)}
      User's Current Draft: ${message || "Empty"}
      
      If the conversation hasn't started, provide 3 witty, profile-specific icebreakers.
      If a conversation is active, suggest a clever follow-up or a funny comment based on the last message.
      Keep it short, charming, and low-pressure.`,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
