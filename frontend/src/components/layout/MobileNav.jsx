import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutGrid, Users, FileText, BarChart3, Home } from 'lucide-react';

export default function MobileNav() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const links = isStudent
    ? [
        { label: 'Dashboard', path: '/student/dashboard', icon: LayoutGrid },
        { label: 'Groups', path: '/student/groups', icon: Users },
        { label: 'Tasks', path: '/student/assignments', icon: FileText },
      ]
    : [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutGrid },
        { label: 'Groups', path: '/admin/groups', icon: Users },
        { label: 'Assignments', path: '/admin/assignments', icon: FileText },
        { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#e1e3e4] z-40 px-3 py-2">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.label}
              to={link.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-[#012d1d] font-bold'
                    : 'text-[#717973] hover:text-[#191c1d]'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
