import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axiosClients';
import { getUserStorage } from '../../utils/storage';

import UserHeader from '../../components/layout/UserHeader';
import Modal from '../../components/common/Modal';
import ProcessRow from './ProcessRow';
import ProcessForm from './ProcessForm'; 
import ProcessDelete from './ProcessDelete';
import WorkflowComments from './WorkflowComments';

const ProcessListView = () => {
    const { workflowId } = useParams();
    const navigate = useNavigate();

    // States
    const [workflowInfo, setWorkflowInfo] = useState(null);
    const [processes, setProcesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
    const [isDocsExpanded, setIsDocsExpanded] = useState(true);
    const [commentsCount, setCommentsCount] = useState(0);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, processItem: null });
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    // Authorization
    const currentUserId = getUserStorage('user_id');
    const currentUserRole = getUserStorage('user_role', 'User');
    const [isPrivileged, setIsPrivileged] = useState(false);

    const showAlert = (title, message, type) => setAlertConfig({ isOpen: true, title, message, type });
    const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

    const fetchData = useCallback(async () => {
        try {
            const [wfRes, processRes] = await Promise.all([
                axiosClient.get(`processes/workflows/${workflowId}/`),
                axiosClient.get(`processes/process/?workflow=${workflowId}`)
            ]);

            setWorkflowInfo(wfRes.data);

            // Access control
            let hasPrivilege = currentUserRole === 'Admin';
            if (!hasPrivilege && wfRes.data.item) {
                const itemRes = await axiosClient.get(`processes/items/${wfRes.data.item}/`);
                if (itemRes.data.category) {
                    const catRes = await axiosClient.get(`processes/categories/${itemRes.data.category}/`);
                    const catLeaderId = typeof catRes.data.leader === 'object' ? catRes.data.leader?.id : catRes.data.leader;
                    hasPrivilege = String(catLeaderId) === String(currentUserId);
                }
            }
            
            setIsPrivileged(hasPrivilege);
            const sortedProcesses = processRes.data.sort((a, b) => a.step - b.step);
            setProcesses(sortedProcesses);
            
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch processes:", error);
            setLoading(false);
            showAlert("Lỗi", "Không thể tải dữ liệu!", "error");
        }
    }, [workflowId, currentUserId, currentUserRole]);

    useEffect(() => {
        if (workflowId) fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        fetchData();
        setIsFormOpen(false);
        showAlert("Thành công", "Đã thêm bước mới!", "success");
    };

    const confirmDelete = async () => {
        try {
            await axiosClient.delete(`processes/process/${deleteModal.processItem.id}/`);
            setProcesses(processes.filter(p => p.id !== deleteModal.processItem.id));
            setDeleteModal({ isOpen: false, processItem: null });
            showAlert("Thành công", "Đã xóa bước thực hiện!", "success");
        } catch (error) {
            showAlert("Lỗi", "Không thể xóa bước này!", "error");
        }
    };

    const filteredProcesses = processes.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center italic text-slate-500">Đang tải dữ liệu...</div>;

    const renderFile = (url) => {
        if (!url) return null;
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.match(/\.(mp4|webm|ogg)$/i)) {
            return (
                <video controls className="w-full max-h-[60vh] object-contain bg-black rounded-xl">
                    <source src={url} />
                    Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
            );
        } else if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            return (
                <img src={url} alt="Workflow attachment" className="w-full max-h-[60vh] object-contain rounded-xl" />
            );
        } else {
            return (
                <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl hover:bg-blue-100 w-fit transition-colors font-medium">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    Tải về tài liệu / Xem file
                </a>
            );
        }
    };

    const oldImages = workflowInfo?.files?.filter(f => f.file_type === 'image') || [];
    const oldVideos = workflowInfo?.files?.filter(f => f.file_type === 'video') || [];
    const oldDocuments = workflowInfo?.files?.filter(f => f.file_type === 'document') || [];

    return (
        <main className="flex flex-col flex-1 bg-slate-50 h-full overflow-hidden">
            
            {/* Header */}
            <UserHeader 
                searchPlaceholder="Tìm kiếm bước..."
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddClick={isPrivileged ? () => setIsFormOpen(true) : null}
                addButtonText="+ Thêm bước"
                
                showContext={!!workflowInfo} 
                onBackClick={() => navigate(-1)}
                contextImage={null} 
                hideContextImage={true}
                contextTitle={workflowInfo ? workflowInfo.name : 'Đang tải...'}
                contextLabel="Quy trình"
            />

            {/* Body */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                
                {/* Left panel */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                    <div className="max-w-4xl mx-auto w-full">
                        
                        {/* Main attachments */}
                        {(oldImages.length > 0 || oldVideos.length > 0 || oldDocuments.length > 0) && (
                            <div className="mb-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                                <div 
                                    className="p-4 sm:p-5 flex justify-between items-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => setIsDocsExpanded(!isDocsExpanded)}
                                >
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Tài liệu / Video chính của quy trình
                                    </h3>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full shrink-0">
                                        {isDocsExpanded ? 'Thu gọn' : 'Mở rộng'}
                                    </span>
                                </div>
                                
                                {isDocsExpanded && (
                                    <div className="p-4 sm:p-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Images */}
                                        {oldImages.map(img => (
                                            <div key={img.id} className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm col-span-1 md:col-span-2">
                                                {renderFile(img.file)}
                                            </div>
                                        ))}
                                        
                                        {/* Videos */}
                                        {oldVideos.map(vid => (
                                            <div key={vid.id} className="rounded-xl overflow-hidden bg-black border border-slate-800 shadow-sm col-span-1 md:col-span-2 relative group">
                                                {renderFile(vid.file)}
                                                <a href={vid.file} download target="_blank" rel="noopener noreferrer" className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-blue-700 z-10 flex items-center gap-2">
                                                    ⬇️ Tải video về
                                                </a>
                                            </div>
                                        ))}
                                        
                                        {/* Documents */}
                                        {oldDocuments.map((doc, idx) => (
                                            <div key={doc.id} className="col-span-1 md:col-span-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
                                                <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-700 truncate mr-2" title={doc.file.split('/').pop()}>
                                                        📄 Tài liệu đính kèm {idx + 1}
                                                    </span>
                                                    <div className="flex gap-2 shrink-0">
                                                        <a href={doc.file} download target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                                            ⬇️ Tải về
                                                        </a>
                                                        <a href={doc.file} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                                            Mở thẻ mới
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="w-full h-[450px] overflow-y-auto custom-scrollbar bg-slate-100">
                                                    {doc.file.toLowerCase().match(/\.(pdf|txt)$/i) ? (
                                                        <iframe 
                                                            src={doc.file} 
                                                            className="w-full h-full border-0 bg-white"
                                                            title={`Tài liệu ${idx + 1}`}
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-white">
                                                            <div className="text-6xl mb-4">📁</div>
                                                            <h3 className="text-lg font-bold text-slate-800 mb-2 break-all line-clamp-2 max-w-md">{doc.file.split('/').pop()}</h3>
                                                            <p className="text-slate-600 font-medium mb-1">Định dạng file này không hỗ trợ xem trực tiếp.</p>
                                                            <p className="text-sm text-slate-500 mb-6">Vui lòng tải file về máy để xem nội dung.</p>
                                                            <a href={doc.file} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm transition-all active:scale-95">
                                                                ⬇️ Tải file về máy
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {processes.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                                <p className="text-slate-500 font-medium">Quy trình này hiện chưa có bước thực hiện nào.</p>
                            </div>
                        ) : filteredProcesses.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500 font-medium">Không tìm thấy bước nào phù hợp với "{searchTerm}"</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {filteredProcesses.map(processItem => (
                                    <ProcessRow 
                                        key={processItem.id} 
                                        processItem={processItem} 
                                        onDelete={(item) => setDeleteModal({ isOpen: true, processItem: item })}
                                        isPrivileged={isPrivileged}
                                        onUpdateSuccess={fetchData}
                                        showAlert={showAlert}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Comments sidebar */}
                <div className={`w-full lg:w-80 xl:w-96 shrink-0 bg-white shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] lg:z-10 border-t lg:border-t-0 lg:border-l border-slate-200 transition-all duration-300 flex flex-col ${isCommentsExpanded ? 'h-[35vh] lg:h-auto' : 'h-[50px] lg:h-auto'}`}>
                    {/* Comments header */}
                    <div 
                        className="flex items-center justify-between px-4 h-[50px] bg-slate-50 border-b border-slate-200 cursor-pointer lg:cursor-default hover:bg-slate-100 lg:hover:bg-slate-50 shrink-0" 
                        onClick={() => {
                            if (window.innerWidth < 1024) setIsCommentsExpanded(!isCommentsExpanded);
                        }}
                    >
                        <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">💬</span>
                            Thảo luận quy trình
                            <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-md ml-1">{commentsCount}</span>
                        </span>
                        <span className="lg:hidden text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {isCommentsExpanded ? 'Thu gọn' : 'Mở rộng'}
                        </span>
                    </div>
                    
                    {/* Comments content */}
                    <div className={`flex-1 overflow-hidden ${!isCommentsExpanded ? 'hidden lg:block' : 'block'}`}>
                        <WorkflowComments workflowId={workflowId} onCountChange={setCommentsCount} />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Thêm Bước Mới">
                <ProcessForm workflowId={workflowId} onSuccess={handleRefresh} showAlert={showAlert} onClose={() => setIsFormOpen(false)} />
            </Modal>

            <ProcessDelete 
                isOpen={deleteModal.isOpen}
                processItem={deleteModal.processItem}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
            />

            <Modal isOpen={alertConfig.isOpen} onClose={closeAlert} title={alertConfig.title}>
                <div className="text-center pb-4">
                    <p className={`text-lg font-medium ${alertConfig.type === 'error' ? 'text-red-600' : 'text-blue-600'}`}>{alertConfig.message}</p>
                    <button onClick={closeAlert} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg">Đóng</button>
                </div>
            </Modal>
        </main>
    );
};

export default ProcessListView;