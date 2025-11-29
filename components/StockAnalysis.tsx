import React from 'react'; // Removed useState
import { Search, TrendingUp, AlertTriangle, ExternalLink, Globe, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useStock } from '../context/StockContext'; // <--- Import Hook

const StockAnalysis: React.FC = () => {
  // Use Global State instead of Local State
  const { symbol, setSymbol, analysisData, isLoading, performAnalysis } = useStock();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performAnalysis(symbol);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Market Intelligence
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
            Leverage Generative AI with real-time grounding to analyze stock sentiment, news, and risk factors instantly.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-lg mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-25"></div>
        <form onSubmit={handleSearch} className="relative bg-slate-900 border border-slate-700 rounded-2xl flex items-center p-2 shadow-2xl">
            <Search className="w-6 h-6 text-slate-500 ml-3" />
            <input 
                type="text" 
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter Stock Symbol (e.g. AAPL, TSLA)"
                className="flex-1 bg-transparent border-none focus:ring-0 text-white px-4 py-2 placeholder-slate-500 text-lg uppercase font-semibold focus:outline-none"
            />
            <button 
                type="submit"
                disabled={isLoading || !symbol.trim()}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg disabled:opacity-50 flex items-center"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
            </button>
        </form>
      </div>

      {/* Results */}
      {analysisData && (
        <div className="space-y-6 animate-fade-in-up">
            {/* Main Analysis Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <TrendingUp className="w-64 h-64 text-emerald-500" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-emerald-500/20 p-2 rounded-lg">
                             <TrendingUp className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Analysis Report: {symbol}</h2>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                         <ReactMarkdown 
                            components={{
                                h1: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
                                h2: ({node, ...props}) => <h4 className="text-lg font-bold text-cyan-300 mt-5 mb-2" {...props} />,
                                strong: ({node, ...props}) => <span className="text-emerald-300 font-semibold" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-slate-300" {...props} />,
                                li: ({node, ...props}) => <li className="marker:text-emerald-500" {...props} />,
                            }}
                         >
                            {analysisData.text}
                         </ReactMarkdown>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center text-amber-400 bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/20">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">AI generated content. Not financial advice.</span>
                        </div>
                        {analysisData.urls.length > 0 && (
                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <span className="text-xs text-slate-500 uppercase font-semibold">Sources</span>
                                <div className="flex flex-wrap gap-2">
                                    {analysisData.urls.slice(0, 3).map((url, idx) => (
                                        <a 
                                            key={idx} 
                                            href={url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
                                        >
                                            <Globe className="w-3 h-3 mr-1.5" />
                                            Source {idx + 1}
                                            <ExternalLink className="w-3 h-3 ml-1.5 opacity-50" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Loading Placeholder / Empty State */}
      {!analysisData && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30">
             {[1, 2, 3].map((i) => (
                 <div key={i} className="h-40 bg-slate-800/30 rounded-2xl border border-slate-700/30"></div>
             ))}
          </div>
      )}
    </div>
  );
};

export default StockAnalysis;