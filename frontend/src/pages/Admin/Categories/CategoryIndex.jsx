import React, { useState, useEffect } from 'react';
import axiosClient from '../../../utils/axiosClients';
import Modal from '../../../components/common/Modal';
import AdminIndexLayout from '../../../components/layout/AdminIndexLayout';
import CategoryForm from './CategoryForm';
import CategoryDelete from './CategoryDelete';
import CategoryRow from './CategoryRow'; // Nhớ import component mới vào

const CategoryIndex = () => {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });

    const showAlert = (title, message, type) => setAlertConfig({ isOpen: true, title, message, type });
    const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

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

    // Hàm Save nhận dữ liệu từ Component con (CategoryRow) truyền lên
    const handleSaveEdit = async (id, updatedData) => {
        try {
            await axiosClient.put(`processes/categories/${id}/`, updatedData);
            setCategories(categories.map(cat => 
                cat.id === id ? { ...cat, ...updatedData } : cat
            ));
            showAlert("Thành công", "Đã cập nhật danh mục!", "success");
        } catch (error) {
            const errorMsg = error.response?.data?.title?.[0] || "Có lỗi xảy ra khi lưu!";
            showAlert("Lỗi cập nhật", errorMsg, "error");
        }
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

    return (
        <AdminIndexLayout
            searchPlaceholder="Tìm kiếm danh mục..."
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddClick={() => setIsModalOpen(true)}
            addButtonText="+ Thêm danh mục"
            loading={loading}
            items={currentItems}
            renderItem={(cat) => (
                // ĐÂY LÀ CHỖ GỌN NHẤT: Thay vì 60 dòng HTML, giờ chỉ còn 1 dòng Component
                <CategoryRow 
                    key={cat.id} 
                    category={cat} 
                    onSave={handleSaveEdit} 
                    onDelete={(categoryToDelete) => setDeleteModal({ isOpen: true, category: categoryToDelete })} 
                />
            )}
            emptyMessage="Không có danh mục nào phù hợp"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        >
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