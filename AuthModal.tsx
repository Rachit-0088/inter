import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, ShieldAlert, CheckCircle, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  initialMode: 'login' | 'register';
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login'
      ? { username, password }
      : { username, email, password, phone, address };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      if (mode === 'register') {
        setSuccess(true);
        // Prompt login toggle or login immediately
        setTimeout(() => {
          setMode('login');
          setSuccess(false);
        }, 1500);
      } else {
        onAuthSuccess(data);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Server error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" id="auth-modal">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition"
          id="close-auth-btn"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <span className="inline-block bg-indigo-600 text-white px-2.5 py-1 rounded font-display font-black text-[10px] tracking-widest uppercase mb-3 shadow-sm shadow-indigo-600/10">
            Aura Shop Security
          </span>
          <h2 className="font-display font-bold text-xl text-slate-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {mode === 'login' ? 'Log in securely to continue shopping.' : 'Register to unlock persistent order histories.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={14} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition"
                placeholder="customer"
                id="auth-username-input"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition"
                  placeholder="name@example.com"
                  id="auth-email-input"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={14} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition"
                placeholder="••••••••"
                id="auth-password-input"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={14} />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Billing & Shipping Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={14} />
                  </span>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                    placeholder="123 Street Name, City, State"
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="text-[10px] text-rose-500 font-bold bg-rose-50 border border-rose-100 rounded-lg p-2 flex items-center">
              <ShieldAlert size={12} className="mr-1.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 rounded-lg p-2 flex items-center animate-bounce">
              <CheckCircle size={12} className="mr-1.5 flex-shrink-0" />
              <span>Registration successful! Swapping to login...</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg text-xs font-bold tracking-wide transition shadow shadow-indigo-600/10"
            id="auth-submit-btn"
          >
            {mode === 'login' ? <LogIn size={13} /> : <UserPlus size={13} />}
            <span>{isLoading ? 'Processing Securely...' : mode === 'login' ? 'Secure Log In' : 'Register Account'}</span>
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <p className="text-[11px] text-slate-400">
            {mode === 'login' ? "Don't have an account yet?" : 'Already registered in our platform?'}
          </p>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline mt-1 focus:outline-none"
            id="auth-toggle-mode-btn"
          >
            {mode === 'login' ? 'Create a secure profile' : 'Log in using existing credentials'}
          </button>
        </div>
      </div>
    </div>
  );
}
