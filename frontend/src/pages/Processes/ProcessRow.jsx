import React, { useState } from 'react';
import { FaTrash, FaChevronDown, FaChevronUp, FaPaperclip, FaFile, FaVideo, FaImage } from 'react-icons/fa';
import axiosClient from '../../utils/axiosClients';
import Modal from '../../components/common/Modal';

const ProcessRow = ({ processItem, onDelete, isPrivileged, onUpdateSuccess, showAlert }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Edit states
    const [localName, setLocalName] = useState(processItem.name);
    const [localStep, setLocalStep] = useState(processItem.step);
    const [localContent, setLocalContent] = useState(processItem.content);
    const [existingImages, setExistingImages] = useState(processItem.images || []);
    const [newFiles, setNewFiles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);

    // Sync existingImages when processItem.images changes from parent re-fetch
    React.useEffect(() => {
        setExistingImages(processItem.images || []);
    }, [processItem.images]);

    const renderFileUrl = (fileUrl) => {
        if (!fileUrl) return null;
        if (fileUrl.startsWith('http')) return fileUrl; 

        let baseURL = axiosClient.defaults.baseURL;
        baseURL = baseURL.replace(/\/api\/?$/, ''); 
        return `${baseURL}${fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl}`;
    };

    const isVideo = (url) => {
        if (!url) return false;
        const lowerUrl = url.toLowerCase();
        return lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.mov');
    };

    const isImage = (url) => {
        if (!url) return false;
        const lowerUrl = url.toLowerCase();
        return lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.gif') || lowerUrl.endsWith('.webp');
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
        setIsExpanded(true);
        setLocalName(processItem.name);
        setLocalStep(processItem.step);
        setLocalContent(processItem.content);
        setExistingImages(processItem.images || []);
        setNewFiles([]);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setNewFiles([]);
    };

    const handleConfirmDeleteImage = async () => {
        if (!imageToDelete) return;
        try {
            await axiosClient.delete(`processes/process-images/${imageToDelete}/`);
            setExistingImages(prev => prev.filter(img => img.id !== imageToDelete));
            setImageToDelete(null);
            if (onUpdateSuccess) onUpdateSuccess();
        } catch (error) {
            if (showAlert) showAlert("Lỗi", "Lỗi khi xóa file!", "error");
            else alert("Lỗi khi xóa file!");
            console.error(error);
            setImageToDelete(null);
        }
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            // Update details
            const formData = new FormData();
            formData.append('name', localName);
            formData.append('step', localStep);
            formData.append('content', localContent);
            formData.append('workflow', processItem.workflow);

            // Upload files
            newFiles.forEach(file => {
                formData.append('images[]', file);
            });

            await axiosClient.put(`processes/process/${processItem.id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsEditing(false);
            setNewFiles([]);
            if (onUpdateSuccess) onUpdateSuccess();
        } catch (error) {
            console.error("Django Error:", error.response?.data);
            const data = error.response?.data || {};
            let errorMessage = "Lỗi khi lưu! Vui lòng kiểm tra dữ liệu.";
            
            if (data.non_field_errors) {
                const isDuplicate = data.non_field_errors.some(msg => msg.includes('unique set') || msg.includes('trùng'));
                if (isDuplicate) {
                    errorMessage = `Bước số ${localStep} đã tồn tại trong quy trình này! Vui lòng chọn số thứ tự khác.`;
                } else {
                    errorMessage = data.non_field_errors[0];
                }
            }
            if (showAlert) showAlert("Thao tác thất bại", errorMessage, "error");
            else alert(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={`mb-3 transition-all duration-300 bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md ${isExpanded ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-200 hover:border-blue-300'}`}>
            
            {/* Header */}
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between p-4 cursor-pointer group bg-white"
            >
                <div className="flex items-center gap-4 flex-1 pr-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 transition-colors ${isExpanded ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                        {processItem.step || '-'}
                    </div>
                    <h3 className={`text-base sm:text-lg font-bold transition-colors line-clamp-1 ${isExpanded ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-600'}`}>
                        {processItem.name}
                    </h3>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                    {!isExpanded && existingImages && existingImages.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold">
                            <FaPaperclip /> {existingImages.length}
                        </div>
                    )}
                    {isPrivileged && (
                        <div className="flex items-center gap-1">
                            {!isEditing && (
                                <button 
                                    onClick={handleEditClick}
                                    className="p-2 text-slate-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors active:scale-95"
                                    title="Sửa bước này"
                                >
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>
                                </button>
                            )}
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onDelete(processItem); 
                                }}
                                className="p-2 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors active:scale-95"
                                title="Xóa bước này"
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    )}
                    <div className={`p-1.5 rounded-full transition-colors ${isExpanded ? 'bg-blue-50 text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`}>
                        {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                    </div>
                </div>
            </div>

            {/* Body */}
            {isExpanded && !isEditing && (
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="mb-4">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Hướng dẫn chi tiết</h4>
                        <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                            {processItem.content || <span className="italic text-slate-400">Không có mô tả chi tiết.</span>}
                        </p>
                    </div>
                    {existingImages && existingImages.length > 0 && (
                        <div>
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">File đính kèm</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {existingImages.map((img) => {
                                    const fileUrl = renderFileUrl(img.image_file);
                                    const fileName = img.image_file ? img.image_file.split('/').pop() : 'Tài liệu';

                                    if (isVideo(img.image_file)) {
                                        return (
                                            <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-black">
                                                <video src={fileUrl} controls className="w-full h-full object-cover" />
                                            </div>
                                        );
                                    } else if (isImage(img.image_file)) {
                                        return (
                                            <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white cursor-zoom-in hover:shadow-md transition-shadow">
                                                <img 
                                                    src={fileUrl} 
                                                    alt={img.caption || `Ảnh đính kèm`} 
                                                    className="w-full h-full object-cover"
                                                    onClick={() => window.open(fileUrl, '_blank')}
                                                />
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <a key={img.id} href={fileUrl} download target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center p-3 transition-colors group">
                                                <FaFile className="text-slate-400 text-3xl mb-2 group-hover:text-blue-500 transition-colors" />
                                                <span className="text-xs text-slate-600 text-center font-medium line-clamp-2 w-full break-all">{fileName}</span>
                                            </a>
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {isExpanded && isEditing && (
                <div className="p-4 sm:p-5 bg-indigo-50/50 border-t border-indigo-100 animate-in fade-in duration-200">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-24 shrink-0">
                                <label className="block text-xs font-bold text-slate-700 mb-1">Thứ tự</label>
                                <input 
                                    type="number" 
                                    value={localStep} 
                                    onChange={(e) => setLocalStep(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-700 mb-1">Tên bước</label>
                                <input 
                                    type="text" 
                                    value={localName} 
                                    onChange={(e) => setLocalName(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Hướng dẫn chi tiết</label>
                            <textarea 
                                value={localContent} 
                                onChange={(e) => setLocalContent(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                            />
                        </div>

                        {existingImages.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">File đã đính kèm (Nhấn X để xóa)</label>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {existingImages.map((img) => {
                                        const fileUrl = renderFileUrl(img.image_file);
                                        return (
                                            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white group">
                                                {isVideo(img.image_file) ? (
                                                    <video src={fileUrl} className="w-full h-full object-cover opacity-70" />
                                                ) : isImage(img.image_file) ? (
                                                    <img src={fileUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full bg-slate-100 text-slate-400">
                                                        <FaFile size={20} />
                                                    </div>
                                                )}
                                                <button 
                                                    onClick={() => setImageToDelete(img.id)}
                                                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    title="Xóa vĩnh viễn"
                                                >
                                                    <FaTrash size={10} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Đính kèm thêm File mới (Tùy chọn)</label>
                            <label className="w-full flex items-center cursor-pointer mb-2">
                                <span className="text-xs py-1.5 px-3 rounded-lg font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors mr-2">
                                    Chọn file
                                </span>
                                <input 
                                    type="file" 
                                    multiple 
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            const filesArray = Array.from(e.target.files);
                                            setNewFiles(prev => [...prev, ...filesArray]);
                                            e.target.value = '';
                                        }
                                    }}
                                    className="hidden"
                                />
                            </label>
                            {newFiles.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {newFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs">
                                            <span className="truncate max-w-[100px]">{file.name}</span>
                                            <button onClick={() => setNewFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 font-bold ml-1">x</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-indigo-100">
                            <button onClick={handleCancelEdit} className="px-4 py-2 text-xs font-bold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
                                Hủy
                            </button>
                            <button onClick={handleSaveEdit} disabled={isSaving} className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <Modal 
                isOpen={!!imageToDelete} 
                onClose={() => setImageToDelete(null)}
                title="Xác nhận xóa file"
            >
                <div className="py-2">
                    <p className="text-slate-600 mb-6">Bạn có chắc muốn xóa file này vĩnh viễn khỏi hệ thống không? Hành động này không thể hoàn tác.</p>
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setImageToDelete(null)}
                            className="px-4 py-2 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={handleConfirmDeleteImage}
                            className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                        >
                            Xóa vĩnh viễn
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProcessRow;