import React from 'react';

const AdminIndexLayout = ({ 
    searchPlaceholder = "Tìm kiếm...", 
    searchTerm, 
    onSearchChange, 
    onAddClick, 
    addButtonText = "+ Thêm mới",
    loading,
    items,
    renderItem,
    emptyMessage = "Không có dữ liệu nào",
    currentPage,
    totalPages,
    onPageChange,
    children 
}) => {
    return (
        <div className="flex flex-col h-full bg-slate-100">
            
            {/* 1. HEADER CHUNG */}
            <header className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-slate-300 shrink-0 shadow-sm gap-4">
                <input 
                    type="text" 
                    placeholder={searchPlaceholder} 
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full sm:w-80 px-4 py-2 transition-all bg-slate-50 border rounded-md outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                />
                {onAddClick && (
                    <button 
                        onClick={onAddClick}
                        className="w-full sm:w-auto px-5 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-md shadow hover:bg-blue-700 active:scale-95"
                    >
                        {addButtonText}
                    </button>
                )}
            </header>

            {/* 2. BODY CHUNG */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                {loading ? (
                    <div className="text-center text-slate-500 mt-10">Đang tải dữ liệu...</div>
                ) : (
                    <div className="flex flex-col space-y-3">
                        {items.length > 0 ? (
                            items.map((item, index) => renderItem(item, index))
                        ) : (
                            <div className="p-8 mt-10 text-center bg-white border border-dashed rounded text-slate-500">
                                {emptyMessage}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {totalPages > 1 && (
                <footer className="flex flex-wrap items-center justify-center px-4 py-4 bg-white border-t border-slate-300 shrink-0">
                    <div className="flex flex-wrap justify-center gap-2">
                        <button onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className={`px-3 py-1 rounded border ${currentPage === 1 ? 'text-slate-400 bg-slate-50 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100'}`}>&laquo; Trước</button>
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            return (
                                <button key={pageNumber} onClick={() => onPageChange(pageNumber)} className={`px-3 py-1 rounded border font-medium ${currentPage === pageNumber ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-700 hover:bg-slate-100'}`}>{pageNumber}</button>
                            );
                        })}
                        <button onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'text-slate-400 bg-slate-50 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100'}`}>Sau &raquo;</button>
                    </div>
                </footer>
            )}

            {children}

        </div>
    );
};

export default AdminIndexLayout;