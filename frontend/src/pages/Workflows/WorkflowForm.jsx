import React, { useState } from 'react';
import axiosClient from '../../utils/axiosClients';

// Create new workflow
const WorkflowForm = ({ onSuccess, onClose, showAlert, itemId }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [videoFiles, setVideoFiles] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [documentFiles, setDocumentFiles] = useState([]);

    const validateFiles = (files, type) => {
        const invalidFiles = [];
        const validFiles = [];
        
        files.forEach(f => {
            if (type === 'image' && !f.type.startsWith('image/')) invalidFiles.push(f.name);
            else if (type === 'video' && !f.type.startsWith('video/')) invalidFiles.push(f.name);
            else if (type === 'document' && !f.name.match(/\.(pdf|doc|docx|xls|xlsx|txt)$/i)) invalidFiles.push(f.name);
            else validFiles.push(f);
        });

        if (invalidFiles.length > 0) {
            showAlert("Sai định dạng", `Các file sau bị loại bỏ vì không đúng định dạng: ${invalidFiles.join(', ')}`, "error");
        }
        return validFiles;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('item', itemId);
        if (videoFiles.length > 0) videoFiles.forEach(f => formData.append('videos[]', f));
        if (imageFiles.length > 0) imageFiles.forEach(f => formData.append('images[]', f));
        if (documentFiles.length > 0) documentFiles.forEach(f => formData.append('documents[]', f));

        try {
            await axiosClient.post('processes/workflows/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onSuccess();
        } catch (err) {
            console.error("Django Workflow Error:", err.response?.data);
            const errorMessage = err.response?.data?.name?.[0] || 
                                 err.response?.data?.description?.[0] || 
                                 "Vui lòng kiểm tra lại dữ liệu nhập vào!";
            showAlert("Thêm thất bại", errorMessage, "error");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Tên quy trình <span className="text-red-500">*</span>
                </label>
                <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 text-base sm:text-sm border border-slate-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 font-medium shadow-sm transition-all"
                    placeholder="Ví dụ: Quy trình bảo trì định kỳ"
                    autoFocus
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Mô tả quy trình
                </label>
                <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 text-base sm:text-sm border border-slate-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 font-medium shadow-sm transition-all resize-none h-24"
                    placeholder="Mô tả ngắn gọn về quy trình này (không bắt buộc)..."
                />
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                    Đính kèm tài liệu chung (Tùy chọn)
                </label>
                
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-col border border-slate-200 rounded-xl p-3 bg-slate-50">
                        <span className="text-xs font-bold text-slate-600 mb-1">Ảnh bìa / Hình ảnh</span>
                        <label className="w-full flex items-center cursor-pointer">
                            <span className="text-xs py-1.5 px-3 rounded-lg font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                                Chọn ảnh
                            </span>
                            <input 
                                type="file" 
                                multiple
                                onChange={(e) => {
                                    const newValid = validateFiles(Array.from(e.target.files), 'image');
                                    setImageFiles(prev => [...prev, ...newValid]);
                                    e.target.value = '';
                                }}
                                className="hidden"
                                accept="image/*"
                            />
                        </label>
                        {imageFiles.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {imageFiles.map((f, i) => (
                                    <span key={i} className="flex items-center gap-1 bg-slate-200 px-2 py-1 rounded text-xs">
                                        <span className="truncate max-w-[80px]">{f.name}</span>
                                        <button type="button" onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 font-bold ml-1">&times;</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col border border-slate-200 rounded-xl p-3 bg-slate-50">
                        <span className="text-xs font-bold text-slate-600 mb-1">Video hướng dẫn</span>
                        <label className="w-full flex items-center cursor-pointer">
                            <span className="text-xs py-1.5 px-3 rounded-lg font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                                Chọn video
                            </span>
                            <input 
                                type="file" 
                                multiple
                                onChange={(e) => {
                                    const newValid = validateFiles(Array.from(e.target.files), 'video');
                                    setVideoFiles(prev => [...prev, ...newValid]);
                                    e.target.value = '';
                                }}
                                className="hidden"
                                accept="video/*"
                            />
                        </label>
                        {videoFiles.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {videoFiles.map((f, i) => (
                                    <span key={i} className="flex items-center gap-1 bg-slate-200 px-2 py-1 rounded text-xs">
                                        <span className="truncate max-w-[80px]">{f.name}</span>
                                        <button type="button" onClick={() => setVideoFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 font-bold ml-1">&times;</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col border border-slate-200 rounded-xl p-3 bg-slate-50">
                        <span className="text-xs font-bold text-slate-600 mb-1">Tài liệu đính kèm (PDF, Word, Excel...)</span>
                        <label className="w-full flex items-center cursor-pointer">
                            <span className="text-xs py-1.5 px-3 rounded-lg font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                                Chọn tài liệu
                            </span>
                            <input 
                                type="file" 
                                multiple
                                onChange={(e) => {
                                    const newValid = validateFiles(Array.from(e.target.files), 'document');
                                    setDocumentFiles(prev => [...prev, ...newValid]);
                                    e.target.value = '';
                                }}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                            />
                        </label>
                        {documentFiles.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {documentFiles.map((f, i) => (
                                    <span key={i} className="flex items-center gap-1 bg-slate-200 px-2 py-1 rounded text-xs">
                                        <span className="truncate max-w-[80px]">{f.name}</span>
                                        <button type="button" onClick={() => setDocumentFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 font-bold ml-1">&times;</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-5 mt-2 border-t border-slate-200">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 border-2 border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-200 hover:text-slate-800 hover:border-slate-500 transition-all cursor-pointer"
                >
                    Hủy
                </button>
                <button 
                    type="submit"
                    className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all cursor-pointer"
                >
                    Lưu thay đổi
                </button>
            </div>
        </form>
    );
};

export default WorkflowForm;