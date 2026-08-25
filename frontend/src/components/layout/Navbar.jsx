import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Search, Bell, Menu, X } from 'lucide-react';
import { getInitials } from '../../utils/formatters.js';

export default function Navbar({ onMobileMenuToggle, isMobileMenuOpen, title, subtitle }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

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

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full bg-white border border-[#e1e3e4] flex items-center justify-center text-[#191c1d] hover:bg-[#f3f4f5] transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#414844]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#e1e3e4] p-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#f3f4f5] mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#191c1d]">
                  Notifications
                </h4>
              </div>
              <p className="text-xs text-[#717973] py-2 text-center">
                You're all caught up.
              </p>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#012d1d] text-white flex items-center justify-center text-xs font-bold">
            {getInitials(user?.name)}
          </div>
        </div>
      </div>
    </header>
  );
}
