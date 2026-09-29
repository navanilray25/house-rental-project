import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, User, LogOut, Building2 } from 'lucide-react';

export default function Navbar({ activeHouseName }) {
  const { currentUser, isAdmin, logout, isSupabase } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    if (isAdmin) {
      navigate('/admin/login');
    } else {
      navigate('/login');
    }
  }

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
              isAdmin ? 'bg-indigo-600 shadow-indigo-600/30' : 'bg-indigo-600 shadow-indigo-500/30'
            }`}>
              {isAdmin ? <Shield className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                {activeHouseName || 'Student House Rental'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">
                  {isAdmin ? 'Landlord Control Desk' : 'Student Resident Portal'}
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.2 rounded-full font-medium ${
                  isSupabase 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSupabase ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  {isSupabase ? 'Supabase Live' : 'Demo Mode'}
                </span>
              </div>
            </div>
          </div>

          {/* User Status & Controls */}
          {currentUser && (
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Role & Name Badge */}
              <div className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isAdmin ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40' : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                    {currentUser.name}
                    {!isAdmin && currentUser.roomNumber && (
                      <span className="text-[11px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                        Room #{currentUser.roomNumber}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium capitalize">
                    {isAdmin ? 'Administrator' : 'Resident Student'}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>

            </div>
          )}

        </div>
      </div>
    </header>
  );
}
