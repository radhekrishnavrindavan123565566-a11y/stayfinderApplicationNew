import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    throw new Error("OPENAI_API_KEY is not configured. Please add it to your .env file.");
  }
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

export function isOpenAIConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !!key && key !== "your_openai_api_key_here";
}
