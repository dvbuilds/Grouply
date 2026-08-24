import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import MobileNav from './MobileNav.jsx';

export default function DashboardLayout({ children, title, subtitle }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] flex overflow-hidden relative">
      {/* Ambient background decoration blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-[#d3bcfc]/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-[#a5d0b9]/25 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#191c1d]/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10 flex flex-col">
            <Sidebar className="!flex !w-full !relative" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto md:ml-64 lg:ml-72 pb-16 md:pb-6">
        <Navbar
          title={title}
          subtitle={subtitle}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <main className="flex-1 px-4 md:px-8 py-2 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileNav />
    </div>
  );
}
