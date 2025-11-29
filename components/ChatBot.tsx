import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'C:/Users/SEC/Desktop/Projects-github/finnova/context/chatContext.tsx'; // Use the hook!
import { Send, Bot, User, Loader2 } from 'lucide-react';

const ChatBot: React.FC = () => {
  const { messages, sendMessage, isLoading, isInitializing } = useChat(); // <--- Get state from Context
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue); // Call context function
    setInputValue('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center">
            <div className="bg-purple-500/20 p-2 rounded-full mr-3">
                <Bot className="w-6 h-6 text-purple-400" />
            </div>
            <div>
                <h2 className="text-white font-semibold">FinNova Expert Advisor</h2>
                <p className="text-xs text-emerald-400 flex items-center">
                    <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isInitializing ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span> 
                    {isInitializing ? 'Analyzing Finances...' : 'Online & Context Aware'}
                </p>
            </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
               <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-2 flex-shrink-0 border border-slate-700">
                 <Bot className="w-5 h-5 text-purple-400" />
               </div>
            )}
            <div className={`max-w-[80%] lg:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-bl-none'
              }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.isStreaming && <span className="inline-block w-1 h-4 bg-purple-400 ml-1 animate-pulse">|</span>}
            </div>
             {msg.role === 'user' && (
               <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center ml-2 flex-shrink-0 border border-cyan-700">
                 <User className="w-5 h-5 text-cyan-400" />
               </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-800/30 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isInitializing ? "Please wait..." : "Ask for financial advice..."}
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500"
            disabled={isLoading || isInitializing}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim() || isInitializing}
            className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(168,85,247,0.4)]"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;