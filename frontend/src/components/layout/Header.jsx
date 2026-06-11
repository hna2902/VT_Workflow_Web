import React from 'react';
import logo from '../../assets/logo.png'; 
// REASON: Import the default avatar image from the assets folder.
// Change 'default-avatar.png' to your actual file name (e.g., 'avatar.jpg').
import defaultAvatar from '../../assets/default-avatar.png'; 
import { FaBell } from 'react-icons/fa';

const Header = () => {
  return (
    // REASON: Applied the linear gradient from white (left) to deep blue (right).
    <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-white to-blue-700 border-b border-slate-300 shrink-0 shadow-sm">
      
      {/* Logo container (Left side - White background) */}
      <div className="flex items-center h-10 cursor-pointer">
        <img src={logo} alt="VT Logo" className="object-contain h-full mr-2" />
        
        <span className="text-xl font-bold text-blue-800">
            <span className="text-red-600">VT</span> Workflow
        </span>
      </div>
      
      {/* Right side container - Notifications & User Profile */}
      {/* REASON: Using 'gap-6' to separate the Bell and the User Profile into two distinct interactive areas. */}
      <div className="flex items-center gap-6">
        
        {/* 1. NOTIFICATION BELL (Moved to the left) */}
        <div className="relative flex items-center justify-center w-10 h-10 text-white rounded-full cursor-pointer hover:bg-white/20 transition-colors">
           <FaBell className="text-lg" />
           {/* Red dot notification */}
           <span className="absolute top-1 right-1 w-2.5 h-2.5 border border-blue-700 rounded-full bg-red-500"></span>
        </div>
        
        {/* 2. USER PROFILE (Avatar + Name) */}
        {/* REASON: Grouping avatar and name together. Added hover opacity to indicate it's clickable (e.g., to open a profile menu later). */}
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
           {/* User Name */}
           <span className="font-medium text-white">Tên Nhân Viên</span>
           {/* Avatar Image */}
           <img 
               src={defaultAvatar} 
               alt="User Avatar" 
               className="w-9 h-9 object-cover rounded-full border-2 border-white/50 shadow-sm" 
           />
        </div>
        
      </div>
      
    </header>
  );
};

export default Header;