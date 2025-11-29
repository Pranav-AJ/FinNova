import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, TrendingUp, MessageSquareText, Cpu, LogOut, User, RefreshCw } from 'lucide-react';
import { AppRoute } from '../types';
import { useAuth } from '../context/AuthContext'; // Import Hook

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook for redirection
  const { user, signOut } = useAuth(); // Hook for Auth actions

  // --- THE HANDLER ---
  const handleSignOut = async () => {
    try {
        await signOut(); // 1. Tell Supabase to kill the session
        navigate('/login'); // 2. Force redirect to Login page
    } catch (error) {
        console.error("Error signing out:", error);
    }
  };

  const navItems = [
    { path: AppRoute.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { path: AppRoute.EXPENSES, icon: Wallet, label: 'Expenses' },
    { path: AppRoute.STOCKS, icon: TrendingUp, label: 'Market Analysis' },
    { path: AppRoute.CHAT, icon: MessageSquareText, label: 'AI Advisor' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0f172a] overflow-hidden bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-0"></div>

      <aside className="relative z-10 w-20 lg:w-64 flex flex-col border-r border-slate-700/50 bg-slate-900/60 backdrop-blur-xl h-full transition-all duration-300">
        
        <div className="flex items-center justify-center lg:justify-start h-20 px-6 border-b border-slate-700/50">
          <div className="p-2 bg-cyan-500/20 rounded-lg shrink-0">
            <Cpu className="w-8 h-8 text-cyan-400" />
          </div>
          <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 hidden lg:block truncate">
            FinNova AI
          </span>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="ml-3 font-medium hidden lg:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 group hover:border-slate-600 transition-colors">
            
            <div className="flex items-center mb-4 justify-center lg:justify-start">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                  <User size={16} />
               </div>
               <div className="ml-3 hidden lg:block overflow-hidden">
                   <p className="text-sm text-white font-medium truncate w-32" title={user?.email}>
                       {user?.email || 'Guest'}
                   </p>
                   <p className="text-[10px] text-emerald-400 flex items-center">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                       Active Session
                   </p>
               </div>
            </div>

            <div className="space-y-2">
                {/* BUTTON 1: Log Out */}
                <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center lg:justify-start px-2 py-2 text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent rounded-lg transition-all"
                >
                    <LogOut className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-red-400" />
                    <span className="ml-3 text-xs font-medium hidden lg:block group-hover:text-red-300">Log Out</span>
                </button>

                {/* BUTTON 2: Switch Account */}
                <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center lg:justify-start px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                >
                    <RefreshCw className="w-4 h-4 shrink-0 text-slate-600 group-hover:text-cyan-400" />
                    <span className="ml-3 text-xs font-medium hidden lg:block group-hover:text-cyan-300">Switch Account</span>
                </button>
            </div>

          </div>
        </div>
      </aside>

      <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="container mx-auto px-6 py-8">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;