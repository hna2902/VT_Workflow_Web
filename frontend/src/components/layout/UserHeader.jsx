import React from 'react';
import { FaArrowLeft, FaImage } from 'react-icons/fa';

const UserHeader = ({ 
    searchPlaceholder = "Tìm kiếm...", 
    searchTerm, 
    onSearchChange, 
    onAddClick, 
    addButtonText = "+ Thêm mới",
    
    // CÁC PROP MỚI: Để hiển thị thông tin bối cảnh bên trái
    showContext = false,
    onBackClick,
    contextImage,
    hideContextImage = false,
    contextTitle,
    contextLabel
}) => {
    return (
        <header className="flex flex-col xl:flex-row xl:items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-slate-300 shrink-0 shadow-sm gap-4 z-10 relative">
            
            {/* KHU VỰC TRÁI: Context (Back + Ảnh + Tên) & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full xl:w-auto flex-1">
                
                {showContext && (
                    <div className="flex items-center gap-3 pr-4 sm:border-r border-slate-200 shrink-0">
                        {onBackClick && (
                            <button 
                                onClick={onBackClick}
                                className="p-2 -ml-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Quay lại"
                            >
                                <FaArrowLeft size={16} />
                            </button>
                        )}
                        
                        {!hideContextImage && (
                            <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                                {contextImage ? (
                                    <img src={contextImage} alt={contextTitle} className="w-full h-full object-cover" />
                                ) : (
                                    <FaImage className="text-slate-300 text-lg" />
                                )}
                            </div>
                        )}
                        
                        <div className="flex flex-col justify-center">
                            {contextLabel && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{contextLabel}</span>}
                            <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate max-w-[150px] sm:max-w-[200px] leading-tight">
                                {contextTitle}
                            </h2>
                        </div>
                    </div>
                )}

                {/* Ô Search */}
                <input 
                    type="text" 
                    placeholder={searchPlaceholder} 
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full sm:w-72 xl:w-80 px-4 py-2 transition-all bg-slate-50 border rounded-md outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-700 font-medium" 
                />
            </div>

            {/* KHU VỰC PHẢI: Nút Thêm Mới */}
            {onAddClick && (
                <button 
                    onClick={onAddClick}
                    className="w-full xl:w-auto px-5 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-md shadow hover:bg-blue-700 active:scale-95 shrink-0"
                >
                    {addButtonText}
                </button>
            )}
        </header>
    );
};

export default UserHeader;