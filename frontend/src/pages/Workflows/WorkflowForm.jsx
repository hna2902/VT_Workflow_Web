import React, { useState } from 'react';
import axiosClient from '../../utils/axiosClients';

// Create new workflow
const WorkflowForm = ({ onSuccess, onClose, showAlert, itemId }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [videoFiles, setVideoFiles] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [documentFiles, setDocumentFiles] = useState([]);

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
                        <input 
                            type="file" 
                            multiple
                            onChange={(e) => setImageFiles(Array.from(e.target.files))}
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                            accept="image/*"
                        />
                        {imageFiles.length > 0 && <span className="text-[10px] text-green-600 font-medium mt-1">Đã chọn {imageFiles.length} ảnh</span>}
                    </div>
                    
                    <div className="flex flex-col border border-slate-200 rounded-xl p-3 bg-slate-50">
                        <span className="text-xs font-bold text-slate-600 mb-1">Video hướng dẫn</span>
                        <input 
                            type="file" 
                            multiple
                            onChange={(e) => setVideoFiles(Array.from(e.target.files))}
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                            accept="video/*"
                        />
                        {videoFiles.length > 0 && <span className="text-[10px] text-green-600 font-medium mt-1">Đã chọn {videoFiles.length} video</span>}
                    </div>

                    <div className="flex flex-col border border-slate-200 rounded-xl p-3 bg-slate-50">
                        <span className="text-xs font-bold text-slate-600 mb-1">Tài liệu đính kèm (PDF, Word, Excel...)</span>
                        <input 
                            type="file" 
                            multiple
                            onChange={(e) => setDocumentFiles(Array.from(e.target.files))}
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                        />
                        {documentFiles.length > 0 && <span className="text-[10px] text-green-600 font-medium mt-1">Đã chọn {documentFiles.length} tài liệu</span>}
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