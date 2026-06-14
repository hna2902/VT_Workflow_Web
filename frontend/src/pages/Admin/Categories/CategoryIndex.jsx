import React, { useState, useEffect } from 'react';
import axiosClient from '../../../utils/axiosClients';
import Modal from '../../../components/common/Modal';
import AdminIndexLayout from '../../../components/layout/AdminIndexLayout';
import CategoryForm from './CategoryForm';
import CategoryDelete from './CategoryDelete';

const CategoryIndex = () => {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Inline Editing
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editStatus, setEditStatus] = useState('Active');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });

    const showAlert = (title, message, type) => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    const closeAlert = () => {
        setAlertConfig({ ...alertConfig, isOpen: false });
    };

    const fetchCategories = async () => {
        try {
            const response = await axiosClient.get('processes/categories/');
            setCategories(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            setLoading(false);
            showAlert("Lỗi", "Không thể tải danh sách danh mục!", "error");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleRefresh = () => {
        fetchCategories(); 
        setIsModalOpen(false);
        showAlert("Thành công", "Đã thêm danh mục mới!", "success");
    };

    const handleEditClick = (category) => {
        setEditingId(category.id);
        setEditTitle(category.title);
        setEditStatus(category.status);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditTitle('');
    };

    const handleSaveEdit = async (id) => {
        try {
            // Gửi cả editTitle và editStatus lên API
            await axiosClient.put(`processes/categories/${id}/`, { 
                title: editTitle,
                status: editStatus // THÊM DÒNG NÀY ĐỂ BÁO CHO SERVER BIẾT
            });
            
            // Cập nhật lại danh sách trên giao diện với cả title và status mới
            setCategories(categories.map(cat => 
                cat.id === id ? { ...cat, title: editTitle, status: editStatus } : cat
            ));
            
            setEditingId(null);
            showAlert("Thành công", "Đã cập nhật danh mục!", "success");
        } catch (error) {
            const errorMsg = error.response?.data?.title?.[0] || "Có lỗi xảy ra khi lưu!";
            showAlert("Lỗi cập nhật", errorMsg, "error");
        }
    };

    const handleDeleteClick = (category) => {
        setDeleteModal({ isOpen: true, category: category });
    };

    const confirmDelete = async () => {
        await axiosClient.delete(`processes/categories/${deleteModal.category.id}/`);
        setCategories(categories.filter(c => c.id !== deleteModal.category.id));
        setDeleteModal({ isOpen: false, category: null });
    };

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

    const renderCategoryRow = (cat) => (
        <div key={cat.id} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 transition-colors bg-white border border-l-4 border-slate-300 border-l-blue-500 rounded shadow-sm hover:bg-slate-50 gap-4 sm:gap-0">
            <div className="flex-1 w-full mr-0 sm:mr-4">
                {editingId === cat.id ? (
                    // TRẠNG THÁI EDIT
                    <div className="flex flex-col gap-3 w-full sm:max-w-sm">
                        <input 
                            type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-2 sm:py-1.5 text-base sm:text-sm font-bold text-slate-800 bg-white border rounded outline-none border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all" 
                            autoFocus placeholder="Tên danh mục"
                        />
                        
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-semibold text-slate-700">Trạng thái:</span>
                            
                            <button 
                                type="button"
                                onClick={() => setEditStatus(editStatus === 'Active' ? 'Inactive' : 'Active')}
                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer"
                                // SỬA MÀU NÚT GẠT: Xanh lá cho Active, Đỏ (hoặc xám) cho Inactive
                                style={{ backgroundColor: editStatus === 'Active' ? '#22c55e' : '#ef4444' }} 
                            >
                                <span 
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                                        editStatus === 'Active' ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                            
                            {/* SỬA MÀU CHỮ LÚC EDIT: Xanh lá / Đỏ */}
                            <span className={`text-sm font-medium transition-colors duration-300 ${editStatus === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                                {editStatus === 'Active' ? 'Hoạt động (Active)' : 'Ẩn (Inactive)'}
                            </span>
                        </div>
                    </div>
                ) : (
                    // TRẠNG THÁI XEM
                    <>
                        <h3 className="text-lg font-bold text-slate-800 break-words">{cat.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Trạng thái: 
                            {/* SỬA MÀU CHỮ LÚC XEM: Xanh lá / Đỏ */}
                            <span className={`ml-1 font-medium ${cat.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                                {cat.status}
                            </span>
                        </p>
                    </>
                )}
            </div>
            
            {/* Phần nút bấm (Lưu / Hủy / Sửa / Xóa) giữ nguyên */}
            <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-20 mt-3 sm:mt-0">
                {editingId === cat.id ? (
                    <>
                        <button onClick={() => handleSaveEdit(cat.id)} className="flex-1 sm:flex-none px-4 py-2 sm:py-1 text-sm font-bold text-white transition-colors bg-green-600 hover:bg-green-700 rounded shadow-sm cursor-pointer">Lưu</button>
                        <button onClick={handleCancelEdit} className="flex-1 sm:flex-none px-4 py-2 sm:py-1 text-sm font-bold text-slate-600 transition-colors bg-slate-200 hover:bg-slate-300 rounded shadow-sm cursor-pointer">Hủy</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => handleEditClick(cat)} className="flex-1 sm:flex-none px-4 py-2 sm:py-1 text-sm font-bold text-blue-700 transition-colors bg-blue-100 hover:bg-blue-200 rounded shadow-sm cursor-pointer">Sửa</button>
                        <button onClick={() => handleDeleteClick(cat)} className="flex-1 sm:flex-none px-4 py-2 sm:py-1 text-sm font-bold text-red-700 transition-colors bg-red-100 hover:bg-red-200 rounded shadow-sm cursor-pointer">Xóa</button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <AdminIndexLayout
            searchPlaceholder="Tìm kiếm danh mục..."
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddClick={() => setIsModalOpen(true)}
            addButtonText="+ Thêm danh mục"
            loading={loading}
            items={currentItems}
            renderItem={renderCategoryRow}
            emptyMessage="Không có danh mục nào phù hợp"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        >
            {/* children */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm Danh Mục Mới">
                <CategoryForm onSuccess={handleRefresh} showAlert={showAlert} onClose={() => setIsModalOpen(false)} />
            </Modal>

            <Modal isOpen={alertConfig.isOpen} onClose={closeAlert} title={alertConfig.title}>
                <div className="text-center pb-4">
                    <p className={`text-lg font-medium ${alertConfig.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{alertConfig.message}</p>
                    <button onClick={closeAlert} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg">Đóng</button>
                </div>
            </Modal>

            <CategoryDelete 
                isOpen={deleteModal.isOpen}
                category={deleteModal.category}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
            />

        </AdminIndexLayout>
    );
};

export default CategoryIndex;