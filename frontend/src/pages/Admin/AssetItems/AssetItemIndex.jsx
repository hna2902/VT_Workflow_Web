import React, { useState, useEffect, useCallback} from 'react';
import { useParams } from 'react-router-dom'; // Get ID
import axiosClient from '../../../utils/axiosClients';
import Modal from '../../../components/common/Modal';
import AdminIndexLayout from '../../../components/layout/AdminIndexLayout';
import AssetItemForm from './AssetItemForm'; 
import AssetItemDelete from './AssetItemDelete';
import AssetItemRow from './AssetItemRow'; 

const AssetItemIndex = () => {
    const { categoryId } = useParams();
    const [assets, setAssets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModal, setEditModal] = useState({ isOpen: false, item: null });
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

    const showAlert = (title, message, type) => setAlertConfig({ isOpen: true, title, message, type });
    const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

    const fetchAssets = async () => {
        try {
            const response = await axiosClient.get(`processes/items/?category=${categoryId}`);
            setAssets(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch assets:", error);
            setLoading(false);
            showAlert("Lỗi", "Không thể tải danh sách tài sản!", "error");
        }
    };

    useEffect(() => {
        if (categoryId) {
            fetchAssets();
        }
    }, [categoryId]);

    const handleRefresh = () => {
        fetchAssets(); 
        setIsModalOpen(false);
        setEditModal({ isOpen: false, item: null });
        showAlert("Thành công", "Đã lưu thông tin tài sản!", "success");
    };

    const handleSaveEdit = async (id, updatedData) => {
        try {
            await axiosClient.put(`processes/items/${id}/`, updatedData);
            setAssets(assets.map(item => 
                item.id === id ? { ...item, ...updatedData } : item
            ));
            showAlert("Thành công", "Đã cập nhật tài sản!", "success");
        } catch (error) {
            const errorMsg = error.response?.data?.title?.[0] || "Có lỗi xảy ra khi lưu!";
            showAlert("Lỗi cập nhật", errorMsg, "error");
        }
    };

    const confirmDelete = async () => {
        await axiosClient.delete(`processes/items/${deleteModal.item.id}/`);
        setAssets(assets.filter(a => a.id !== deleteModal.item.id));
        setDeleteModal({ isOpen: false, item: null });
        showAlert("Thành công", "Đã xóa tài sản!", "success");
    };

    const filteredAssets = assets.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <AdminIndexLayout
            searchPlaceholder="Tìm kiếm tài sản..."
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddClick={() => setIsModalOpen(true)}
            addButtonText="+ Thêm tài sản"
            loading={loading}
            items={currentItems}
            renderItem={(item) => (
                <AssetItemRow 
                    key={item.id} 
                    item={item} 
                    onSave={handleSaveEdit} 
                    onEdit={(itemToEdit) => setEditModal({ isOpen: true, item: itemToEdit })}
                    onDelete={(itemToDelete) => setDeleteModal({ isOpen: true, item: itemToDelete })} 
                />
            )}
            emptyMessage={
                assets.length === 0 
                    ? "Danh mục này hiện chưa có tài sản nào." 
                    : `Không tìm thấy tài sản nào phù hợp với từ khóa: "${searchTerm}"`
            }
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        >
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm Tài Sản Mới">
                {/* Pass categoryId for creation */}
                <AssetItemForm onSuccess={handleRefresh} showAlert={showAlert} onClose={() => setIsModalOpen(false)} categoryId={categoryId} />
            </Modal>

            <Modal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, item: null })} title="Cập Nhật Tài Sản">
                {editModal.item && (
                    <AssetItemForm 
                        onSuccess={handleRefresh} 
                        showAlert={showAlert} 
                        onClose={() => setEditModal({ isOpen: false, item: null })} 
                        categoryId={categoryId}
                        initialData={editModal.item} 
                    />
                )}
            </Modal>

            <Modal isOpen={alertConfig.isOpen} onClose={closeAlert} title={alertConfig.title}>
                <div className="text-center pb-4">
                    <p className={`text-lg font-medium ${alertConfig.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{alertConfig.message}</p>
                    <button onClick={closeAlert} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg">Đóng</button>
                </div>
            </Modal>

            <AssetItemDelete 
                isOpen={deleteModal.isOpen}
                item={deleteModal.item}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
            />
        </AdminIndexLayout>
    );
};

export default AssetItemIndex;