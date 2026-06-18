import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPen, FaTrash, FaImage, FaPlus } from 'react-icons/fa';
import axiosClient from '../../../utils/axiosClients';
import { getUserStorage } from '../../../utils/storage';
import Modal from '../../../components/common/Modal';
import UserHeader from '../../../components/layout/UserHeader';
import AssetItemForm from '../../Admin/AssetItems/AssetItemForm';
import AssetItemDelete from '../../Admin/AssetItems/AssetItemDelete';

const AssetItemView = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    const [assets, setAssets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editItem, setEditItem] = useState(null); 
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    const currentUserId = getUserStorage('user_id'); 
    const currentUserRole = getUserStorage('user_role', 'User');
    const [isPrivileged, setIsPrivileged] = useState(false); 

    const showAlert = (title, message, type) => setAlertConfig({ isOpen: true, title, message, type });
    const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

    const fetchData = useCallback(async () => {
        try {
            const [catRes, assetsRes] = await Promise.all([
                axiosClient.get(`processes/categories/${categoryId}/`),
                axiosClient.get(`processes/items/?category=${categoryId}`)
            ]);

            const catLeaderId = typeof catRes.data.leader === 'object' ? catRes.data.leader?.id : catRes.data.leader;
            const hasPrivilege = currentUserRole === 'Admin' || String(catLeaderId) === String(currentUserId);
            
            setIsPrivileged(hasPrivilege);

            const activeAssets = hasPrivilege 
                ? assetsRes.data 
                : assetsRes.data.filter(item => item.status !== 'Inactive');
            
            setAssets(activeAssets);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            setLoading(false);
            showAlert("Lỗi", "Không thể tải dữ liệu!", "error");
        }
    }, [categoryId, currentUserId, currentUserRole]);

    useEffect(() => {
        if (categoryId) fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        fetchData(); 
        setIsFormOpen(false);
        setEditItem(null);
        showAlert("Thành công", "Đã cập nhật dữ liệu!", "success");
    };

    const confirmDelete = async () => {
        try {
            await axiosClient.delete(`processes/items/${deleteModal.item.id}/`);
            setAssets(assets.filter(a => a.id !== deleteModal.item.id));
            setDeleteModal({ isOpen: false, item: null });
            showAlert("Thành công", "Đã xóa tài sản!", "success");
        } catch (error) {
            showAlert("Lỗi", "Không thể xóa tài sản này!", "error");
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:8000${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const filteredAssets = assets.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="flex flex-col flex-1 bg-slate-50 relative h-full">
            <UserHeader 
                searchPlaceholder="Tìm kiếm tài sản..."
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddClick={isPrivileged ? () => setIsFormOpen(true) : null}
                addButtonText="+ Thêm tài sản"
            />

            {/* Asset Cards Grid */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                {loading ? (
                    <div className="text-slate-500 text-center italic mt-10">Đang tải dữ liệu...</div>
                ) : assets.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500 font-medium text-lg">Danh mục này hiện chưa có tài sản nào.</p>
                    </div>
                ) : filteredAssets.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500 font-medium text-lg">Không tìm thấy tài sản nào phù hợp với từ khóa: "{searchTerm}"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 items-start">
                        {filteredAssets.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => navigate(`/assets/${item.id}/workflows`)} 
                                className={`relative overflow-hidden bg-white border rounded-xl shadow-sm border-slate-200 border-t-4 group cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${item.status === 'Inactive' ? 'border-t-slate-400 opacity-75' : 'border-t-blue-500'}`}
                            >
                                {isPrivileged && (
                                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setEditItem(item); // Gán tài sản vào state để Form nhận diện là đang Edit
                                                setIsFormOpen(true); 
                                            }}
                                            className="flex items-center justify-center w-7 h-7 text-xs text-blue-600 bg-white/90 backdrop-blur border border-blue-100 rounded-full shadow hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                            title="Sửa"
                                        >
                                            <FaPen size={10} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, item: item }); }}
                                            className="flex items-center justify-center w-7 h-7 text-xs text-red-600 bg-white/90 backdrop-blur border border-red-100 rounded-full shadow hover:bg-red-50 hover:text-red-700 transition-colors"
                                            title="Xóa"
                                        >
                                            <FaTrash size={10} />
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center justify-center h-32 sm:h-40 bg-slate-100 border-b border-slate-100">
                                    {item.image ? (
                                        <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-300">
                                            <FaImage size={24} className="mb-2" />
                                            <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-3 sm:p-4 text-center">
                                    <h3 className="font-bold text-slate-700 text-sm sm:text-base truncate" title={item.title}>
                                        {item.title}
                                    </h3>
                                    {isPrivileged && item.status === 'Inactive' && (
                                        <p className="text-xs text-red-500 font-medium mt-1">Đang ẩn</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal 
                isOpen={isFormOpen} 
                onClose={() => { setIsFormOpen(false); setEditItem(null); }} 
                title={editItem ? "Cập Nhật Tài Sản" : "Thêm Tài Sản Mới"}
            >
                <AssetItemForm 
                    initialData={editItem} 
                    onSuccess={handleRefresh} 
                    showAlert={showAlert} 
                    onClose={() => { setIsFormOpen(false); setEditItem(null); }} 
                    categoryId={categoryId} 
                />
            </Modal>

            <Modal isOpen={alertConfig.isOpen} onClose={closeAlert} title={alertConfig.title}>
                <div className="text-center pb-4">
                    <p className={`text-lg font-medium ${alertConfig.type === 'error' ? 'text-red-600' : 'text-blue-600'}`}>{alertConfig.message}</p>
                    <button onClick={closeAlert} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg">Đóng</button>
                </div>
            </Modal>

            <AssetItemDelete 
                isOpen={deleteModal.isOpen}
                item={deleteModal.item}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
            />
        </main>
    );
};

export default AssetItemView;