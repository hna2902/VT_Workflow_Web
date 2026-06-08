import React from 'react';

const MainContent = ({ activeCategory }) => {
  return (
    // Main area with very light slate background
    <main className="flex flex-col flex-1 bg-slate-50">
      
      {/* Toolbar with slate-200 background */}
      <div className="flex items-center px-6 py-3 shadow-sm bg-slate-200 border-b border-slate-300 shrink-0">
        <input 
          type="text" 
          placeholder="Tìm kiếm" 
          // White input field to stand out against the slate toolbar
          className="px-4 py-2 transition-all bg-white border rounded outline-none border-slate-300 w-72 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
        />
        <button className="flex items-center justify-center w-10 h-10 ml-4 text-2xl text-white transition-colors bg-blue-600 rounded shadow-sm hover:bg-blue-700">
          +
        </button>
      </div>

      {/* Asset cards grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex gap-4">
          
          {/* Card item with white background and subtle shadow */}
          <div className="relative w-48 overflow-hidden bg-white border rounded shadow border-slate-200 border-t-4 border-t-blue-500 group">
            <button className="absolute flex items-center justify-center w-6 h-6 text-xs text-red-600 transition-opacity rounded opacity-0 top-2 right-2 bg-red-100 group-hover:opacity-100 hover:bg-red-500 hover:text-white">
              ✕
            </button>

            <div className="flex items-center justify-center h-24 bg-slate-100">
              <span className="text-sm text-slate-400">Hình ảnh</span>
            </div>
            <div className="py-3 font-medium text-center border-t text-slate-700 border-slate-100">
              {activeCategory} abc...
            </div>
          </div>

        </div>
      </div>
      
    </main>
  );
};

export default MainContent;