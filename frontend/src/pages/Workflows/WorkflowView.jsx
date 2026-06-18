import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axiosClients';
import { getUserStorage } from '../../utils/storage';
import { FaImage, FaArrowLeft, FaPlus } from 'react-icons/fa';
import WorkflowRow from './WorkflowRow';
import WorkflowForm from './WorkflowForm';
import WorkflowDelete from './WorkflowDelete';
import UserHeader from '../../components/layout/UserHeader';
import Modal from '../../components/common/Modal';

const WorkflowView = () => {
    const { itemId } = useParams(); // Format: /assets/:itemId/workflows
    const navigate = useNavigate();

    // STATE DỮ LIỆU
    const [assetInfo, setAssetInfo] = useState(null);
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // STATE MODAL
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, workflow: null });
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    // STATE QUYỀN TRUY CẬP (OBJECT-LEVEL PERMISSION)
    const currentUserId = getUserStorage('user_id');
    const currentUserRole = getUserStorage('user_role', 'User');
    const [isPrivileged, setIsPrivileged] = useState(false);

    const showAlert = (title, message, type) => setAlertConfig({ isOpen: true, title, message, type });
    const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:8000${path.startsWith('/') ? '' : '/'}${path}`;
    };

    // FETCH DỮ LIỆU & KIỂM TRA QUYỀN
    const fetchData = useCallback(async () => {
        try {
            // Bước 1: Gọi API lấy Asset và Workflows
            const [assetRes, workflowRes] = await Promise.all([
                axiosClient.get(`processes/items/${itemId}/`),
                axiosClient.get(`processes/workflows/?item=${itemId}`)
            ]);

            setAssetInfo(assetRes.data);

            // Bước 2: TRUY NGƯỢC QUYỀN. 
            // Từ Asset -> Lấy ID Category -> Gọi API Category -> So sánh Leader ID
            let hasPrivilege = currentUserRole === 'Admin';
            if (!hasPrivilege && assetRes.data.category) {
                const catRes = await axiosClient.get(`processes/categories/${assetRes.data.category}/`);
                const catLeaderId = typeof catRes.data.leader === 'object' ? catRes.data.leader?.id : catRes.data.leader;
                hasPrivilege = String(catLeaderId) === String(currentUserId);
            }
            
            setIsPrivileged(hasPrivilege);
            setWorkflows(workflowRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch workflow data:", error);
            setLoading(false);
            showAlert("Lỗi", "Không thể tải dữ liệu quy trình!", "error");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId, currentUserId, currentUserRole]);

    useEffect(() => {
        if (itemId) fetchData();
    }, [fetchData]);

    // HANDLERS
    const handleRefresh = () => {
        fetchData();
        setIsFormOpen(false);
        showAlert("Thành công", "Đã thêm quy trình mới!", "success");
    };

    const handleSaveEdit = async (id, updatedData) => {
        try {
            // 1. Delete old files if requested
            if (updatedData.deleted_file_ids && updatedData.deleted_file_ids.length > 0) {
                await Promise.all(updatedData.deleted_file_ids.map(fileId => 
                    axiosClient.delete(`processes/workflow-files/${fileId}/`)
                ));
            }

            // 2. Upload new data (and new files)
            const payload = new FormData();
            payload.append('name', updatedData.name);
            if (updatedData.description !== undefined && updatedData.description !== null) {
                payload.append('description', updatedData.description);
            }

            if (updatedData.image_files && updatedData.image_files.length > 0) {
                updatedData.image_files.forEach(f => payload.append('images[]', f));
            }
            if (updatedData.video_files && updatedData.video_files.length > 0) {
                updatedData.video_files.forEach(f => payload.append('videos[]', f));
            }
            if (updatedData.document_files && updatedData.document_files.length > 0) {
                updatedData.document_files.forEach(f => payload.append('documents[]', f));
            }

            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const res = await axiosClient.patch(`processes/workflows/${id}/`, payload, config);
            
            // Reload workflow data directly from backend response
            setWorkflows(workflows.map(w => w.id === id ? { ...w, ...res.data } : w));
            showAlert("Thành công", "Đã cập nhật quy trình!", "success");
        } catch (error) {
            const errorMsg = error.response?.data?.name?.[0] || error.response?.data?.title?.[0] || "Có lỗi xảy ra khi lưu!";
            showAlert("Lỗi", errorMsg, "error");
        }
    };

    const confirmDelete = async () => {
        try {
            await axiosClient.delete(`processes/workflows/${deleteModal.workflow.id}/`);
            setWorkflows(workflows.filter(w => w.id !== deleteModal.workflow.id));
            setDeleteModal({ isOpen: false, workflow: null });
            showAlert("Thành công", "Đã xóa quy trình!", "success");
        } catch (error) {
            showAlert("Lỗi", "Không thể xóa quy trình này!", "error");
        }
    };

    const filteredWorkflows = workflows.filter(w => 
        w.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center italic text-slate-500">Đang tải dữ liệu...</div>;

    return (
        <main className="flex flex-col flex-1 bg-slate-50 h-full overflow-hidden">
            
            {/* 2. KHU VỰC TOOLBAR (Dùng chung UserHeader) */}
            <UserHeader 
                searchPlaceholder="Tìm kiếm quy trình..."
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddClick={isPrivileged ? () => setIsFormOpen(true) : null}
                addButtonText="+ Thêm quy trình"
                
                // Mở khóa sức mạnh Context trên Header
                showContext={!!assetInfo} 
                onBackClick={() => navigate(-1)}
                contextImage={assetInfo ? getImageUrl(assetInfo.image) : null}
                contextTitle={assetInfo ? assetInfo.title : 'Đang tải...'}
                contextLabel="Tài sản"
            />

            {/* KHU VỰC BODY BÂY GIỜ CHỈ CÒN ĐÚNG CÁI DANH SÁCH DỌC */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto w-full">
                    {workflows.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                            <p className="text-slate-500 font-medium">Tài sản này hiện chưa có quy trình nào.</p>
                        </div>
                    ) : filteredWorkflows.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500 font-medium">Không tìm thấy quy trình phù hợp với "{searchTerm}"</p>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-3">
                            {filteredWorkflows.map(workflow => (
                                <WorkflowRow 
                                    key={workflow.id} 
                                    workflow={workflow} 
                                    onSave={handleSaveEdit}
                                    onDelete={(wf) => setDeleteModal({ isOpen: true, workflow: wf })}
                                    isPrivileged={isPrivileged}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 4. KHU VỰC MODALS */}
            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Thêm Quy Trình Mới">
                <WorkflowForm 
                    itemId={itemId} 
                    onSuccess={handleRefresh} 
                    showAlert={showAlert} 
                    onClose={() => setIsFormOpen(false)} 
                />
            </Modal>

            <Modal isOpen={alertConfig.isOpen} onClose={closeAlert} title={alertConfig.title}>
                <div className="text-center pb-4">
                    <p className={`text-lg font-medium ${alertConfig.type === 'error' ? 'text-red-600' : 'text-blue-600'}`}>{alertConfig.message}</p>
                    <button onClick={closeAlert} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg">Đóng</button>
                </div>
            </Modal>

            <WorkflowDelete 
                isOpen={deleteModal.isOpen}
                workflow={deleteModal.workflow}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
            />

        </main>
    );
};

export default WorkflowView;