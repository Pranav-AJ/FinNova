import React, { useState, useEffect, useMemo } from 'react';
import { Expense, Saving } from '../types';
import { Plus, Trash2, PieChart as PieIcon, List, Sparkles, TrendingUp, TrendingDown, Wallet, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { analyzeExpenses } from '../services/geminiService';
import { supabase } from '../services/supabase'; // Import Supabase
import { useAuth } from '../context/AuthContext'; // Get User ID

const COLORS = ['#22d3ee', '#818cf8', '#f472b6', '#34d399', '#fbbf24', '#f87171'];

const ExpenseTracker: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'expenses' | 'savings'>('expenses');
  const [loadingData, setLoadingData] = useState(true);
  
  // Expenses State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Food', date: '' });
  
  // Savings State (Note: We need a 'savings' table in Supabase too, but we'll stick to expenses for now to keep it simple)
  // For this example, I will keep savings local, but show you how expenses work with DB.
  const [savings, setSavings] = useState<Saving[]>([]);
  const [newSaving, setNewSaving] = useState({ description: '', amount: '', category: 'Salary', date: '' });

  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- 1. FETCH DATA FROM SUPABASE ON LOAD ---
  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      if (data) setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // --- 2. ADD EXPENSE TO SUPABASE ---
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.date || !user) return;

    const amount = parseFloat(newExpense.amount);

    try {
      // Optimistic UI Update (Show it immediately before DB confirms)
      const tempId = Date.now().toString();
      const optimisitcExpense = {
        id: tempId,
        user_id: user.id,
        description: newExpense.description,
        amount: amount,
        category: newExpense.category,
        date: newExpense.date
      };
      setExpenses([optimisitcExpense, ...expenses]);
      setNewExpense({ description: '', amount: '', category: 'Food', date: '' });

      // Send to Supabase
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          { 
            user_id: user.id,
            description: optimisitcExpense.description,
            amount: optimisitcExpense.amount,
            category: optimisitcExpense.category,
            date: optimisitcExpense.date
          }
        ])
        .select();

      if (error) throw error;

      // Update the temporary ID with the real ID from DB
      if (data) {
        setExpenses(prev => prev.map(ex => ex.id === tempId ? data[0] : ex));
      }

    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to save expense');
      fetchExpenses(); // Revert on error
    }
  };

  // --- 3. DELETE FROM SUPABASE ---
  const handleDeleteExpense = async (id: string) => {
    // Optimistic Delete
    const previousExpenses = [...expenses];
    setExpenses(expenses.filter(e => e.id !== id));

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting:', error);
      setExpenses(previousExpenses); // Revert if failed
    }
  };

  // Keep Savings Local for now (or repeat the logic above for a 'savings' table)
  const handleAddSaving = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaving.description || !newSaving.amount || !newSaving.date) return;
    const saving: Saving = {
      id: Date.now().toString(),
      description: newSaving.description,
      amount: parseFloat(newSaving.amount),
      category: newSaving.category,
      date: newSaving.date,
    };
    setSavings([saving, ...savings]);
    setNewSaving({ description: '', amount: '', category: 'Salary', date: '' });
  };

  const handleDeleteSaving = (id: string) => {
    setSavings(savings.filter(s => s.id !== id));
  };

  const handleAiAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    const result = await analyzeExpenses(expenses);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  // --- Computations ---
  const totalExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  const totalSavings = useMemo(() => savings.reduce((acc, curr) => acc + curr.amount, 0), [savings]);
  const balance = totalSavings - totalExpenses;

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    if (activeTab === 'expenses') {
        expenses.forEach(e => {
            data[e.category] = (data[e.category] || 0) + e.amount;
        });
    } else {
        savings.forEach(s => {
            data[s.category] = (data[s.category] || 0) + s.amount;
        });
    }
    return Object.keys(data).map(key => ({ name: key, value: data[key] }));
  }, [expenses, savings, activeTab]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">Transaction Tracker</h1>
           <p className="text-slate-400">Manage your income flows and spending habits.</p>
        </div>
        <button 
            onClick={handleAiAnalyze}
            disabled={isAnalyzing || expenses.length === 0}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Sparkles className={`w-5 h-5 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing Habits...' : 'AI Spending Audit'}
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl flex items-center space-x-4">
             <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                <TrendingUp className="w-6 h-6" />
             </div>
             <div>
                 <p className="text-slate-400 text-xs uppercase tracking-wider">Total Savings/Income</p>
                 <p className="text-xl font-bold text-white">${totalSavings.toFixed(2)}</p>
             </div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl flex items-center space-x-4">
             <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400">
                <TrendingDown className="w-6 h-6" />
             </div>
             <div>
                 <p className="text-slate-400 text-xs uppercase tracking-wider">Total Expenses</p>
                 <p className="text-xl font-bold text-white">
                    {loadingData ? '...' : `$${totalExpenses.toFixed(2)}`}
                 </p>
             </div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl flex items-center space-x-4">
             <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
                <Wallet className="w-6 h-6" />
             </div>
             <div>
                 <p className="text-slate-400 text-xs uppercase tracking-wider">Net Balance</p>
                 <p className={`text-xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>${balance.toFixed(2)}</p>
             </div>
        </div>
      </div>

      {aiAnalysis && (
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-6 rounded-2xl animate-fade-in">
          <h3 className="text-lg font-semibold text-indigo-300 mb-2 flex items-center">
            <Sparkles className="w-4 h-4 mr-2" /> AI Financial Audit
          </h3>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-line">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-700/50 w-fit">
        <button
            onClick={() => setActiveTab('expenses')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'expenses'
                ? 'bg-gradient-to-r from-rose-500/20 to-purple-600/20 text-rose-300 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
        >
            Expenses
        </button>
        <button
            onClick={() => setActiveTab('savings')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'savings'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-600/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
        >
            Savings & Income
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl h-fit">
          <h2 className="text-xl font-semibold text-white mb-4">
            {activeTab === 'expenses' ? 'Add Expense' : 'Add Saving'}
          </h2>
          
          {activeTab === 'expenses' ? (
              // Expense Form
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="e.g. Starbucks"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Amount ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="0.00"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                    <input
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                    />
                    </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center bg-rose-600 hover:bg-rose-500 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-2"
                >
                  <Plus className="w-5 h-5 mr-2" /> Add Expense
                </button>
              </form>
          ) : (
              // Savings Form (Still Local)
              <form onSubmit={handleAddSaving} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Source / Description</label>
                  <input
                    type="text"
                    value={newSaving.description}
                    onChange={(e) => setNewSaving({...newSaving, description: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Oct Salary"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Amount ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={newSaving.amount}
                        onChange={(e) => setNewSaving({...newSaving, amount: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0.00"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                    <input
                        type="date"
                        value={newSaving.date}
                        onChange={(e) => setNewSaving({...newSaving, date: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                    />
                    </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={newSaving.category}
                    onChange={(e) => setNewSaving({...newSaving, category: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Investment">Investment Return</option>
                    <option value="Gift">Gift</option>
                    <option value="Savings Deposit">Savings Deposit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-2"
                >
                  <Plus className="w-5 h-5 mr-2" /> Add Saving
                </button>
              </form>
          )}
        </div>

        {/* Charts & List */}
        <div className="lg:col-span-2 space-y-6">
           {/* Chart */}
           <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <PieIcon className={`w-5 h-5 mr-2 ${activeTab === 'expenses' ? 'text-rose-400' : 'text-emerald-400'}`}/> 
                {activeTab === 'expenses' ? 'Spending Distribution' : 'Income Sources'}
              </h2>
              <div className="h-64 w-full flex items-center justify-center">
                {loadingData && activeTab === 'expenses' ? (
                   <div className="flex flex-col items-center text-slate-500">
                     <Loader2 className="w-8 h-8 animate-spin mb-2"/>
                     <span className="text-sm">Syncing with secure database...</span>
                   </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1e293b" />
                        ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#e2e8f0' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend />
                    </PieChart>
                    </ResponsiveContainer>
                )}
              </div>
           </div>

           {/* List */}
           <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <List className={`w-5 h-5 mr-2 ${activeTab === 'expenses' ? 'text-rose-400' : 'text-emerald-400'}`}/> 
                {activeTab === 'expenses' ? 'Recent Transactions' : 'Recent Income'}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-700 text-slate-400 text-sm">
                            <th className="py-3 px-2">Description</th>
                            <th className="py-3 px-2">Category</th>
                            <th className="py-3 px-2">Date</th>
                            <th className="py-3 px-2">Amount</th>
                            <th className="py-3 px-2 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeTab === 'expenses' ? (
                             expenses.length === 0 ? (
                                <tr><td colSpan={5} className="py-4 text-center text-slate-500">{loadingData ? 'Loading...' : 'No expenses recorded.'}</td></tr>
                             ) : (
                                expenses.map((expense) => (
                                    <tr key={expense.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-2 text-white font-medium">{expense.description}</td>
                                        <td className="py-3 px-2">
                                            <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-slate-400 text-sm">{expense.date}</td>
                                        <td className="py-3 px-2 text-rose-400 font-medium">-${expense.amount.toFixed(2)}</td>
                                        <td className="py-3 px-2 text-right">
                                            <button 
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                className="text-slate-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                             )
                        ) : (
                             // Savings are still local
                             savings.length === 0 ? (
                                <tr><td colSpan={5} className="py-4 text-center text-slate-500">No savings recorded.</td></tr>
                             ) : (
                                savings.map((saving) => (
                                    <tr key={saving.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-2 text-white font-medium">{saving.description}</td>
                                        <td className="py-3 px-2">
                                            <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                                                {saving.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-slate-400 text-sm">{saving.date}</td>
                                        <td className="py-3 px-2 text-emerald-400 font-medium">+${saving.amount.toFixed(2)}</td>
                                        <td className="py-3 px-2 text-right">
                                            <button 
                                                onClick={() => handleDeleteSaving(saving.id)}
                                                className="text-slate-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                             )
                        )}
                    </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;