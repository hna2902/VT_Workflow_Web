import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Nhớ import Modal và CategoryForm vào nhé
import Modal from '../../components/common/Modal'; 
import CategoryForm from './CategoryForm';

const CategoryIndex = () => {
    // ==========================================
    // KHU VỰC 1: STATES (Bộ nhớ của Component)
    // ==========================================
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Inline Editing (Sửa tại chỗ)
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    
    // Đóng mở Modal Thêm mới
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ==========================================
    // KHU VỰC 2: EFFECTS (Gọi API lúc mới vào trang)
    // ==========================================
    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://localhost:8000/api/categories/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ==========================================
    // KHU VỰC 3: HANDLERS (Các hàm xử lý sự kiện)
    // ==========================================
    const handleRefresh = () => {
        fetchCategories(); 
        setIsModalOpen(false);
    };

    const handleEditClick = (category) => {
        setEditingId(category.id);
        setEditTitle(category.title);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditTitle('');
    };

    const handleSaveEdit = async (id) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.put(`http://localhost:8000/api/categories/${id}/`, 
                { title: editTitle }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCategories(categories.map(cat => 
                cat.id === id ? { ...cat, title: editTitle } : cat
            ));
            setEditingId(null);
        } catch (error) {
            alert("Có lỗi xảy ra khi lưu!");
        }
    };

    // Chuẩn bị dữ liệu phân trang trước khi vẽ giao diện
    const filteredCategories = categories.filter(cat => 
        cat.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);


    // ==========================================
    // KHU VỰC 4: RENDER (Vẽ giao diện - CHỈ CÓ 1 LỆNH RETURN Ở ĐÂY)
    // ==========================================
    return (
        <div className="flex flex-col h-full bg-slate-100">
            
            {/* 1. HEADER (Thanh tìm kiếm & Nút Thêm) */}
            {/* RESPONSIVE FIX: 
                - flex-col trên mobile (xếp dọc).
                - sm:flex-row trên tablet/desktop (xếp ngang).
                - gap-4 để tạo khoảng cách khi xếp dọc.
            */}
            <header className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-slate-300 shrink-0 shadow-sm gap-4">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm danh mục..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    // RESPONSIVE FIX: w-full trên mobile, sm:w-80 trên màn hình lớn.
                    className="w-full sm:w-80 px-4 py-2 transition-all bg-slate-50 border rounded-md outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                />
                <button 
                    onClick={() => setIsModalOpen(true)}
                    // RESPONSIVE FIX: w-full trên mobile để dễ bấm, w-auto trên màn hình lớn.
                    className="w-full sm:w-auto px-5 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-md shadow hover:bg-blue-700"
                >
                    + Thêm danh mục
                </button>
            </header>

            {/* 2. BODY (Danh sách xếp chồng) */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                {loading ? (
                    <div className="text-center text-slate-500 mt-10">Đang tải dữ liệu...</div>
                ) : (
                    <div className="flex flex-col space-y-3">
                        {currentItems.length > 0 ? (
                            currentItems.map((cat) => (
                                <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 transition-colors bg-white border border-l-4 border-slate-300 border-l-blue-500 rounded shadow-sm hover:bg-slate-50 gap-4 sm:gap-0">
                                    
                                    <div className="flex-1 w-full mr-0 sm:mr-4">
                                        {editingId === cat.id ? (
                                            <input 
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                // RESPONSIVE FIX: max-w-full để ô nhập liệu giãn đều trên mobile.
                                                className="w-full sm:max-w-sm px-3 py-1 font-bold text-slate-800 bg-white border rounded outline-none border-blue-400 focus:ring-2 focus:ring-blue-200"
                                                autoFocus
                                            />
                                        ) : (
                                            <h3 className="text-lg font-bold text-slate-800 break-words">{cat.title}</h3>
                                        )}
                                        
                                        <p className="text-sm text-slate-500 mt-1">
                                            Trạng thái: <span className={cat.status === 'Active' ? 'text-green-600 font-medium' : 'text-slate-500'}>{cat.status}</span>
                                        </p>
                                    </div>
                                    <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-20">
                                        {editingId === cat.id ? (
                                            <>
                                                <button onClick={() => handleSaveEdit(cat.id)} className="flex-1 sm:flex-none px-4 py-1.5 sm:py-1 text-sm font-medium text-white transition-colors bg-green-600 rounded shadow-sm hover:bg-green-700">Lưu</button>
                                                <button onClick={handleCancelEdit} className="flex-1 sm:flex-none px-4 py-1.5 sm:py-1 text-sm font-medium text-slate-600 transition-colors bg-slate-200 rounded hover:bg-slate-300">Hủy</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditClick(cat)} className="flex-1 sm:flex-none px-4 py-1.5 sm:py-1 text-sm font-medium text-blue-700 transition-colors bg-blue-100 rounded hover:bg-blue-600 hover:text-white">Sửa</button>
                                                <button className="flex-1 sm:flex-none px-4 py-1.5 sm:py-1 text-sm font-medium text-red-700 transition-colors bg-red-100 rounded hover:bg-red-600 hover:text-white">Xóa</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 mt-10 text-center bg-white border border-dashed rounded text-slate-500">
                                Không có danh mục nào
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* 3. FOOTER (Phân trang) */}
            {totalPages > 1 && (
                // RESPONSIVE FIX: flex-wrap để các nút số trang tự rớt dòng nếu màn hình quá nhỏ.
                <footer className="flex flex-wrap items-center justify-center px-4 py-4 bg-white border-t border-slate-300 shrink-0">
                    <div className="flex flex-wrap justify-center gap-2">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-3 py-1 rounded border ${currentPage === 1 ? 'text-slate-400 bg-slate-50 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100'}`}>&laquo; Trước</button>
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            return (
                                <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`px-3 py-1 rounded border font-medium ${currentPage === pageNumber ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-700 hover:bg-slate-100'}`}>{pageNumber}</button>
                            );
                        })}
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'text-slate-400 bg-slate-50 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100'}`}>Sau &raquo;</button>
                    </div>
                </footer>
            )}

            {/* 4. MODAL */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Thêm Danh Mục Mới"
                onSave={() => document.getElementById('category-form').requestSubmit()}
            >
                <CategoryForm onSuccess={handleRefresh} />
            </Modal>

        </div>
    );
};

export default CategoryIndex;