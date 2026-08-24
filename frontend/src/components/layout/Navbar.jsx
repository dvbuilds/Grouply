import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Search, Bell, Menu, X, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { getInitials } from '../../utils/formatters.js';

export default function Navbar({ onMobileMenuToggle, isMobileMenuOpen, title, subtitle }) {
  const { user, switchDemoUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const demoPersonas = [
    { email: 'prof@joineazy.dev', name: 'Prof. Alexander Smith', role: 'admin', label: 'Admin (Professor)' },
    { email: 'divya@joineazy.dev', name: 'Divya Sharma', role: 'student', label: 'Student (Team Alpha Leader)' },
    { email: 'aarav@joineazy.dev', name: 'Aarav Patel', role: 'student', label: 'Student (Team Alpha Member)' },
    { email: 'riya@joineazy.dev', name: 'Riya Sen', role: 'student', label: 'Student (Team Beta Leader)' },
    { email: 'andrea@joineazy.dev', name: 'Andrea Brown', role: 'student', label: 'Student (Andrea Brown)' },
  ];

  return (
    <header className="w-full px-4 md:px-8 py-4 flex items-center justify-between z-20 shrink-0">
      {/* Page Title / Mobile menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-xl bg-white border border-[#e1e3e4] text-[#191c1d]"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div>
          {subtitle && <p className="text-xs font-medium text-[#717973]">{subtitle}</p>}
          <h2 className="text-xl md:text-2xl font-bold text-[#191c1d] tracking-tight">
            {title || 'Joineazy'}
          </h2>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search Bar (Desktop) */}
        <div className="relative hidden lg:block w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
          <input
            type="text"
            placeholder="Search assignments, groups..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-white/90 border border-[#e1e3e4] focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/10 outline-none transition-all placeholder:text-[#717973]"
          />
        </div>

        {/* Demo Switcher Quick Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e1e3e4] hover:border-[#012d1d] text-xs font-medium text-[#012d1d] shadow-2xs hover-lift"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span className="hidden sm:inline font-semibold">Test Persona:</span>
            <span className="truncate max-w-[100px] sm:max-w-[140px] text-[#414844]">
              {user?.name || 'Switch Role'}
            </span>
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#e1e3e4] p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#f3f4f5]">
                <span className="text-xs font-bold text-[#191c1d]">Quick Persona Switcher</span>
                <span className="text-[10px] bg-[#2D6A4F]/10 text-[#2D6A4F] font-semibold px-2 py-0.5 rounded-full">
                  Instant Test
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {demoPersonas.map((p) => (
                  <button
                    key={p.email}
                    onClick={() => {
                      switchDemoUser(p.email);
                      setShowRoleSwitcher(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                      user?.email === p.email
                        ? 'bg-[#012d1d]/10 text-[#012d1d] font-bold'
                        : 'hover:bg-[#f8f9fa] text-[#414844]'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-[#191c1d]">{p.name}</p>
                      <p className="text-[11px] text-[#717973]">{p.label}</p>
                    </div>
                    {user?.email === p.email && (
                      <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full bg-white border border-[#e1e3e4] flex items-center justify-center text-[#191c1d] hover:bg-[#f3f4f5] transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#414844]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#D90429] rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e1e3e4] p-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#f3f4f5] mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#191c1d]">
                  Notifications
                </h4>
                <span className="text-[11px] text-[#2D6A4F] font-semibold">Mark read</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex gap-2.5 p-2 rounded-xl bg-[#f8f9fa]">
                  <div className="w-2 h-2 rounded-full bg-[#2D6A4F] mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium text-[#191c1d]">Assignment Confirmed</p>
                    <p className="text-[#717973] text-[11px] mt-0.5">Group Alpha submitted JS Basics.</p>
                  </div>
                </div>
                <div className="flex gap-2.5 p-2 rounded-xl hover:bg-[#f8f9fa]">
                  <div className="w-2 h-2 rounded-full bg-[#FB8500] mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium text-[#191c1d]">Upcoming Deadline</p>
                    <p className="text-[#717973] text-[11px] mt-0.5">HTML & CSS due Sep 28.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border border-[#e1e3e4] shadow-xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#012d1d] text-white flex items-center justify-center text-xs font-bold">
              {getInitials(user?.name)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
