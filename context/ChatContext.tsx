import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { createChatSession } from '../services/geminiService';
import { useAuth } from './AuthContext';
import { ChatMessage } from '../types';

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  isInitializing: boolean;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: async () => {},
  isLoading: false,
  isInitializing: true,
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const chatSessionRef = useRef<any>(null);

  // 1. Initialize Chat Session when User Logs In
  useEffect(() => {
    if (!user) {
        setMessages([]);
        chatSessionRef.current = null;
        return;
    }

    // If session already exists, don't re-initialize (Preserves chat on tab switch!)
    if (chatSessionRef.current) return;

    const initSession = async () => {
      setIsInitializing(true);
      try {
        // Fetch Context Data
        const { data: expenses } = await supabase.from('expenses').select('*');
        const { data: savings } = await supabase.from('savings').select('*');
        
        const expenseData = expenses || [];
        const savingData = savings || [];
        
        const totalExp = expenseData.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalInc = savingData.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const balance = totalInc - totalExp;

        const systemPrompt = `
          You are FinNova, a financial expert.
          USER DATA:
          - Balance: $${balance.toFixed(2)}
          - Income: $${totalInc.toFixed(2)}
          - Expenses: $${totalExp.toFixed(2)}
          
          Act as a professional advisor. Keep answers concise.
        `;

        chatSessionRef.current = createChatSession(systemPrompt);

        setMessages([{
            id: 'welcome',
            role: 'model',
            text: `Hello. I have loaded your financial profile (Net Balance: $${balance.toFixed(2)}). I am ready to advise you.`,
            timestamp: new Date()
        }]);
      } catch (err) {
        console.error("Chat Init Error:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    initSession();
  }, [user]);

  // 2. Send Message Logic
  const sendMessage = async (text: string) => {
    if (!chatSessionRef.current) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const botMsgId = (Date.now() + 1).toString();
      // Add placeholder
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: new Date(), isStreaming: true }]);

      const result = await chatSessionRef.current.sendMessageStream(text);
      
      let fullText = '';
      for await (const chunk of result.stream) {
        fullText += chunk.text();
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m));
      }
      
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, isStreaming: false } : m));
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Connection error. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isLoading, isInitializing }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);