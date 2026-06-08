import React from 'react';

const Header = () => {
  return (
    // Header container with white background
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
      
      {/* Logo container */}
      <div className="flex items-center h-10">
        {/* TODO: Place your logo image in the 'public' folder and uncomment the img tag below */}
        {/* <img src="/logo.png" alt="Company Logo" className="object-contain h-full" /> */}
        
        <span className="text-xl font-bold text-blue-600"><span className="text-red-500">VT</span> Workflow</span>
      </div>
      
      {/* User profile & notifications */}
      <div className="flex items-center">
        <span className="mr-4 font-medium text-gray-700">Tên Nhân Viên</span>
        <div className="relative flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
           <span className="absolute top-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-red-500"></span>
        </div>
      </div>
    </header>
  );
};

export default Header;