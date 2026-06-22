import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Prevent render if closed
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    // Backdrop overlay
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 transition-opacity">
      
      {/* Clickable overlay */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

      {/* Modal box */}
      <div className="relative w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        
        {/* Scrollable content */}
        <div className="overflow-y-auto pr-1 -mr-1 custom-scrollbar">{children}</div>
      </div>
    </div>,
    document.body // Render at root
  );
};

export default Modal;