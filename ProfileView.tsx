import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, ArrowLeft, Phone, MapPin, Mail, Save } from 'lucide-react';
import { User } from '../types';

interface ProfileViewProps {
  currentUser: any; // User type
  onUpdateProfile: (updatedFields: { email: string; phone: string; address: string }) => Promise<void>;
  onBackToHome: () => void;
}

export default function ProfileView({
  currentUser,
  onUpdateProfile,
  onBackToHome,
}: ProfileViewProps) {
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess(false);

    try {
      await onUpdateProfile({ email, phone, address });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8" id="profile-view">
      {/* Back Header */}
      <div className="mb-6">
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          id="profile-back-btn"
        >
          <ArrowLeft size={14} />
          <span>Back to Catalog</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold uppercase shadow-md">
            {currentUser?.username[0]}
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-indigo-900">My Secure Profile</h1>
            <p className="text-slate-400 text-xs">Manage your personal settings, addresses and contact numbers.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4" id="profile-form">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Username (Unchangeable)</label>
            <input
              type="text"
              disabled
              value={currentUser?.username || ''}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              id="profile-email-input"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              id="profile-phone-input"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Shipping & Billing Address</label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-none"
              placeholder="123 Street Name, City, State"
              id="profile-address-input"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-500 font-semibold bg-rose-50 border border-rose-100 rounded-lg p-2.5">
              {error}
            </div>
          )}

          {success && (
            <div className="text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
              Profile updated successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg text-xs font-bold tracking-wide transition shadow"
            id="profile-save-btn"
          >
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
