import React from 'react';
import { FaArrowLeft, FaImage } from 'react-icons/fa';

const UserHeader = ({ 
    searchPlaceholder = "Tìm kiếm...", 
    searchTerm, 
    onSearchChange, 
    onAddClick, 
    addButtonText = "+ Thêm mới",
    
    // Display context info
    showContext = false,
    onBackClick,
    contextImage,
    hideContextImage = false,
    contextTitle,
    contextLabel
}) => {
    return (
        <header className="flex flex-col xl:flex-row xl:items-center px-4 sm:px-6 py-4 bg-white border-b border-slate-300 shrink-0 shadow-sm gap-3 z-10 relative">
            
            {/* Context */}
            {showContext && (
                <div className="flex items-center gap-3 w-full xl:w-auto pr-0 xl:pr-4 xl:border-r border-slate-200 overflow-hidden shrink-0">
                    {onBackClick && (
                        <button 
                            onClick={onBackClick}
                            className="p-2 -ml-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors shrink-0"
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
                    
                    <div className="flex flex-col justify-center min-w-0">
                        {contextLabel && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{contextLabel}</span>}
                        <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate max-w-[200px] sm:max-w-[300px] leading-tight">
                            {contextTitle}
                        </h2>
                    </div>
                </div>
            )}

            {/* Search and add button */}
            <div className="flex flex-row items-center gap-2 w-full xl:flex-1">
                <input 
                    type="text" 
                    placeholder={searchPlaceholder} 
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 xl:max-w-[300px] px-4 py-2.5 text-sm transition-all bg-slate-50 border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-700 font-medium min-w-[120px]" 
                />
                
                {onAddClick && (
                    <button 
                        onClick={onAddClick}
                        className="shrink-0 xl:ml-auto px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow hover:bg-blue-700 active:scale-95 whitespace-nowrap"
                    >
                        {addButtonText}
                    </button>
                )}
            </div>
        </header>
    );
};

export default UserHeader;