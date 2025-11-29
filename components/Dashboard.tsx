
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, Activity, MessageSquareText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';

const mockData = [
  { name: 'Jan', savings: 4000, expenses: 2400 },
  { name: 'Feb', savings: 3000, expenses: 1398 },
  { name: 'Mar', savings: 2000, expenses: 9800 },
  { name: 'Apr', savings: 2780, expenses: 3908 },
  { name: 'May', savings: 1890, expenses: 4800 },
  { name: 'Jun', savings: 2390, expenses: 3800 },
  { name: 'Jul', savings: 3490, expenses: 4300 },
];

const StatCard: React.FC<{ title: string; value: string; trend?: string; icon: React.ElementType; color: string }> = ({ title, value, trend, icon: Icon, color }) => (
  <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-600 transition-all duration-300">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon className="w-24 h-24" />
    </div>
    <div className="relative z-10">
      <div className={`p-3 rounded-lg w-fit ${color} bg-opacity-20 mb-4`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {trend && <p className="text-emerald-400 text-sm mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> {trend}</p>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Financial Overview</h1>
        <p className="text-slate-400">Welcome back. AI systems are operational.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Balance" value="$24,562.00" trend="+12.5%" icon={DollarSign} color="text-emerald-400 bg-emerald-400" />
        <StatCard title="Monthly Spend" value="$3,240.50" trend="-2.3%" icon={Activity} color="text-purple-400 bg-purple-400" />
        <StatCard title="Portfolio Risk" value="Moderate" icon={AlertTriangle} color="text-amber-400 bg-amber-400" />
        <StatCard title="AI Insights" value="3 New" icon={TrendingUp} color="text-cyan-400 bg-cyan-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Cash Flow Analytics</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#e2e8f0' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="savings" stroke="#22d3ee" fillOpacity={1} fill="url(#colorSavings)" />
                <Area type="monotone" dataKey="expenses" stroke="#f472b6" fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-4">
             <div 
                onClick={() => navigate(AppRoute.EXPENSES)}
                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer group"
             >
                <div className="flex items-center justify-between">
                    <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">Add Expense</span>
                    <DollarSign className="w-5 h-5 text-slate-500 group-hover:text-cyan-400" />
                </div>
             </div>
             <div 
                onClick={() => navigate(AppRoute.CHAT)}
                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer group"
             >
                <div className="flex items-center justify-between">
                    <span className="text-slate-300 group-hover:text-purple-400 transition-colors">Ask AI Advisor</span>
                    <MessageSquareText className="w-5 h-5 text-slate-500 group-hover:text-purple-400" />
                </div>
             </div>
             <div 
                onClick={() => navigate(AppRoute.STOCKS)}
                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer group"
             >
                <div className="flex items-center justify-between">
                    <span className="text-slate-300 group-hover:text-emerald-400 transition-colors">Analyze Stock</span>
                    <TrendingUp className="w-5 h-5 text-slate-500 group-hover:text-emerald-400" />
                </div>
             </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <h4 className="text-sm font-medium text-slate-400 mb-3">Market Snapshot</h4>
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">S&P 500</span>
                <span className="text-emerald-400">+1.24%</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-slate-300">NASDAQ</span>
                <span className="text-emerald-400">+0.98%</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-slate-300">BTC</span>
                <span className="text-red-400">-0.45%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
