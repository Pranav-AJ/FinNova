import React, { createContext, useContext, useState } from 'react';
import { analyzeStock } from '../services/geminiService';

interface AnalysisData {
  text: string;
  urls: string[];
}

interface StockContextType {
  symbol: string;
  setSymbol: (s: string) => void;
  analysisData: AnalysisData | null;
  isLoading: boolean;
  performAnalysis: (sym: string) => Promise<void>;
  clearAnalysis: () => void;
}

const StockContext = createContext<StockContextType>({
  symbol: '',
  setSymbol: () => {},
  analysisData: null,
  isLoading: false,
  performAnalysis: async () => {},
  clearAnalysis: () => {},
});

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [symbol, setSymbol] = useState('');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const performAnalysis = async (sym: string) => {
    if (!sym) return;
    setIsLoading(true);
    // Don't clear previous data immediately so we don't get a flash of empty screen
    try {
      const result = await analyzeStock(sym);
      setAnalysisData(result);
    } catch (error) {
      console.error("Stock Analysis Failed:", error);
      setAnalysisData({ 
        text: "### Analysis Error\nI could not retrieve data for this ticker. Please check the symbol and try again.", 
        urls: [] 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnalysis = () => {
    setSymbol('');
    setAnalysisData(null);
  };

  return (
    <StockContext.Provider value={{ symbol, setSymbol, analysisData, isLoading, performAnalysis, clearAnalysis }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => useContext(StockContext);