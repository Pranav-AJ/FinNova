import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your actual key or use import.meta.env.VITE_GEMINI_API_KEY if using Vite
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const createChatSession = (systemInstruction: string) => {
  return model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: `System Instruction: ${systemInstruction}` }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am ready to act as your financial expert using the provided data." }],
      },
    ],
  });
};

export const analyzeExpenses = async (expenses: any[]) => {
  const prompt = `Analyze these expenses and give 3 bullet points on spending habits: ${JSON.stringify(expenses)}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

export const analyzeStock = async (symbol: string) => {
    const prompt = `Analyze the stock ${symbol} for risk and sentiment. Format as markdown.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { text: response.text(), urls: [] };
}