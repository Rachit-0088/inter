import React, { useState } from 'react';
import { ShoppingCart, LogOut, Shield, ClipboardList, Search, User, LogIn, UserPlus } from 'lucide-react';
import { User as UserType, Category } from '../types';

interface NavbarProps {
  currentUser: UserType | null;
  onLogout: () => void;
  onOpenCart: () => void;
  cartCount: number;
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigateTo: (view: 'home' | 'orders' | 'admin' | 'profile' | 'auth') => void;
  currentView: string;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export default function Navbar({
  currentUser,
  onLogout,
  onOpenCart,
  cartCount,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onNavigateTo,
  currentView,
  onOpenAuthModal,
}: NavbarProps) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => {
                onSelectCategory(null);
                onSearchChange('');
                onNavigateTo('home');
              }}
              className="flex items-center space-x-2 text-slate-950 font-display font-bold text-xl tracking-tight transition hover:opacity-90"
              id="navbar-logo-btn"
            >
              <span className="bg-indigo-600 text-white px-2.5 py-1 rounded font-display font-black text-sm tracking-widest mr-1.5">AURA</span>
              <span className="text-xl font-bold tracking-tight text-indigo-900">E<span className="font-light text-slate-500">-COMMERCE</span></span>
            </button>

            {/* Category Filter Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => onSelectCategory(null)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  selectedCategory === null && currentView === 'home'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
                id="cat-all-btn"
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onNavigateTo('home');
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    selectedCategory === cat.id && currentView === 'home'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                  id={`cat-${cat.id}-btn`}
                >
                  {cat.category_name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-xs mx-4 hidden sm:block">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentView !== 'home') onNavigateTo('home');
                }}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition"
                id="navbar-search-input"
              />
            </div>
          </div>

          {/* Right Side Options */}
          <div className="flex items-center space-x-3">
            {/* Search Toggle for Mobile */}
            <div className="sm:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-50 cursor-pointer">
              <Search size={20} onClick={() => {
                const query = prompt('Enter product name or keyword:');
                if (query !== null) {
                  onSearchChange(query);
                  onNavigateTo('home');
                }
              }} />
            </div>

            {/* Shopping Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-full transition"
              id="navbar-cart-btn"
            >
              <ShoppingCart size={21} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Dropdown / Controls */}
            {currentUser ? (
              <div className="flex items-center space-x-2 border-l border-slate-100 pl-3">
                {/* Admin Button */}
                {currentUser.isAdmin && (
                  <button
                    onClick={() => onNavigateTo('admin')}
                    className={`p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition relative group`}
                    title="Admin Dashboard"
                    id="navbar-admin-btn"
                  >
                    <Shield size={21} />
                    <span className="absolute right-0 top-10 hidden group-hover:block bg-indigo-900 text-white text-[10px] px-2 py-0.5 rounded shadow">Admin</span>
                  </button>
                )}

                {/* Orders Button */}
                <button
                  onClick={() => onNavigateTo('orders')}
                  className={`p-2 ${
                    currentView === 'orders' ? 'text-slate-950 bg-slate-50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  } rounded-full transition relative group`}
                  title="My Orders"
                  id="navbar-orders-btn"
                >
                  <ClipboardList size={21} />
                  <span className="absolute right-0 top-10 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow">Orders</span>
                </button>

                {/* Profile Greeting */}
                <button
                  onClick={() => onNavigateTo('profile')}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition text-slate-700 hover:text-slate-950"
                  id="navbar-profile-btn"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {currentUser.username[0].toUpperCase()}
                  </div>
                  <span className="hidden lg:inline text-xs font-medium tracking-tight">
                    {currentUser.username}
                  </span>
                </button>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-full transition"
                  title="Logout"
                  id="navbar-logout-btn"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 border-l border-slate-100 pl-3">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition"
                  id="navbar-login-btn"
                >
                  <LogIn size={15} />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm hover:shadow"
                  id="navbar-register-btn"
                >
                  <UserPlus size={15} />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
