import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Prevent rendering if modal is closed
  if (!isOpen) return null;

  return (
    // Backdrop overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      
      {/* Modal box */}
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        
        {/* Modal header with title and close button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button 
            onClick={onClose}
            className="text-2xl transition-colors text-slate-400 hover:text-red-500"
          >
            &times;
          </button>
        </div>

        {/* Dynamic content injection point */}
        <div>
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;