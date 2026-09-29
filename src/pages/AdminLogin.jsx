import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, KeyRound, Building2 } from 'lucide-react';

export default function AdminLogin({ houseSettings }) {
  const { currentUser, login, register, authError } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser?.role === 'admin') {
      navigate('/admin');
    }
  }, [currentUser, navigate]);

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isRegistering) {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role: 'admin',
        adminKey: adminPasscode.trim(),
      });
      setLoading(false);
      if (res.success) {
        navigate('/admin');
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        if (res.user.role !== 'admin') {
          setErrorMsg('This account is a student account. Please sign in with landlord credentials.');
        } else {
          navigate('/admin');
        }
      } else {
        if (res.error?.toLowerCase().includes('invalid login credentials')) {
          setErrorMsg('Admin account not found in your Supabase database yet. Please click "Register Admin Account" below (Passcode: admin123) to register it, or re-check your password.');
        } else {
          setErrorMsg(res.error || 'Invalid admin credentials.');
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mb-4 border border-indigo-400/30">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Landlord Administration
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          {houseSettings?.houseName || 'Student Rental Management'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">
              {isRegistering ? 'Register Landlord Account' : 'Landlord Secure Sign In'}
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              URL: /admin
            </span>
          </div>

          {(errorMsg || authError) && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs rounded-xl font-medium">
              {errorMsg || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Property Manager"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Master Admin Passcode
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="Enter admin123"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Default passcode is <code className="text-indigo-400 font-mono">admin123</code></p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@rental.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? 'Verifying...' : isRegistering ? 'Register as Admin' : 'Access Landlord Desk'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          <div className="pt-2 text-center text-xs text-slate-400 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); }}
              className="text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              {isRegistering ? 'Already have an admin account? Sign In' : 'First time setting up? Register Admin Account'}
            </button>

            <div className="pt-2 border-t border-slate-800">
              <a
                href="/"
                className="text-slate-500 hover:text-slate-300"
              >
                ← Return to Student Resident Portal
              </a>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

