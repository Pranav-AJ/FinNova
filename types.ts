
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface Saving {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface StockAnalysisResult {
  symbol: string;
  price: string;
  analysis: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Unknown';
  groundingUrls: string[];
}

export enum AppRoute {
  DASHBOARD = '/',
  EXPENSES = '/expenses',
  STOCKS = '/stocks',
  CHAT = '/chat',
}
