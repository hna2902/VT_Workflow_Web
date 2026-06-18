import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Prevent rendering if modal is closed
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    // Backdrop overlay: Đã xóa backdrop-blur-sm, chỉ dùng bg-black/60 để làm tối nền phía sau
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 transition-opacity">
      
      {/* Lớp Overlay để bấm thoát */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

      {/* Modal box: Vẫn giữ lại animation mượt mà cho khối nội dung */}
      <div className="relative w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        
        {/* Vùng chứa nội dung có thể scroll nếu vượt quá 90vh */}
        <div className="overflow-y-auto pr-1 -mr-1 custom-scrollbar">{children}</div>
      </div>
    </div>,
    document.body // Ép Modal nằm ở cấp độ cao nhất của HTML
  );
};

export default Modal;