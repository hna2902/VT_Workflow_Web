import React, { useState, useRef } from 'react';
import axiosClient from '../../utils/axiosClients';
import { FaFile, FaTrash, FaVideo, FaImage } from 'react-icons/fa';

const ProcessForm = ({ onSuccess, onClose, showAlert, workflowId }) => {
    const [name, setName] = useState('');
    const [step, setStep] = useState('');
    const [content, setContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...filesArray]); 
            e.target.value = null; 
        }
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('step', parseInt(step) || 1);
        formData.append('content', content);
        formData.append('workflow', workflowId);

        selectedFiles.forEach(file => {
            formData.append('images[]', file); 
        });

        try {
            await axiosClient.post('processes/process/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onSuccess(); 
        } catch (err) {
            console.error("Django Error:", err.response?.data);
            const data = err.response?.data || {};
            let errorMessage = data?.name?.[0] || data?.content?.[0] || "Vui lòng kiểm tra lại dữ liệu nhập vào!";
            
            if (data.non_field_errors) {
                const isDuplicate = data.non_field_errors.some(msg => msg.includes('unique set') || msg.includes('trùng'));
                if (isDuplicate) errorMessage = `Bước số ${step} đã tồn tại trong quy trình này! Vui lòng chọn số thứ tự khác.`;
                else errorMessage = data.non_field_errors[0];
            }
            
            showAlert("Thêm thất bại", errorMessage, "error");
        }
    };

    return (
        // REASON: Used flex-col and max-h to control the form height dynamically on small screens.
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(100vh-10rem)]">
            
            {/* VÙNG SCROLLABLE: Nội dung form tự động cuộn nếu quá dài */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
                <div className="flex gap-4">
                    <div className="w-24 shrink-0">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Thứ tự <span className="text-red-500">*</span></label>
                        <input 
                            type="number" 
                            required 
                            min="1"
                            value={step} 
                            onChange={(e) => setStep(e.target.value)}
                            className="w-full px-4 py-2 text-base sm:text-sm border border-slate-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 font-medium shadow-sm transition-all text-center"
                            placeholder="1"
                            autoFocus
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên bước thực hiện <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            required 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 text-base sm:text-sm border border-slate-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 font-medium shadow-sm transition-all"
                            placeholder="Ví dụ: Tháo nắp bảo vệ"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nội dung chi tiết <span className="text-red-500">*</span></label>
                    <textarea 
                        required
                        value={content} 
                        onChange={(e) => setContent(e.target.value)}
                        // REASON: Reduced textarea height from h-24 to h-20 to save vertical space.
                        className="w-full px-4 py-2 text-base sm:text-sm border border-slate-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 font-medium shadow-sm transition-all resize-none h-20"
                        placeholder="Mô tả chi tiết cách thực hiện bước này..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">File đính kèm (Ảnh, Video, Tài liệu...) <span className="text-red-500">*</span></label>
                    
                    {/* REASON: Compressed the drag-and-drop area. Reduced padding (py-10 -> py-5) and icon size. */}
                    <div 
                        onClick={() => fileInputRef.current.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl px-4 py-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors bg-white shadow-sm flex flex-col items-center"
                    >
                        <div className="flex gap-2 mb-2 text-slate-300 text-2xl">
                            <FaImage />
                            <FaVideo />
                            <FaFile />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Nhấn hoặc kéo thả file vào đây</p>
                        <p className="text-xs text-slate-500 mt-1">Không giới hạn định dạng và dung lượng.</p>
                    </div>
                    
                    <input 
                        type="file" 
                        multiple 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="*/*"
                        className="hidden"
                        required={selectedFiles.length === 0}
                    />

                    {/* Preview Files */}
                    {selectedFiles.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-3">
                            {selectedFiles.map((file, index) => {
                                const isVideo = file.type.startsWith('video/');
                                const isImage = file.type.startsWith('image/');
                                return (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200 bg-slate-50 flex items-center justify-center">
                                        {isImage ? (
                                            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                        ) : isVideo ? (
                                            <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-2 flex flex-col items-center justify-center w-full h-full">
                                                <FaFile className="text-slate-400 text-2xl mb-1" />
                                                <p className="text-[10px] text-slate-500 truncate w-full px-1">{file.name}</p>
                                            </div>
                                        )}
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveFile(index)}
                                            className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-red-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-700"
                                        >
                                            <FaTrash size={8} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            
            {/* VÙNG STICKY: Nút bấm được ghim cố định ở đáy */}
            <div className="shrink-0 flex flex-col-reverse sm:flex-row gap-3 pt-4 mt-2 border-t border-slate-200 bg-white">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="w-full sm:flex-1 px-4 py-2.5 border-2 border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-200 hover:text-slate-800 hover:border-slate-500 transition-all cursor-pointer"
                >
                    Hủy
                </button>
                <button 
                    type="submit" 
                    className="w-full sm:flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all cursor-pointer"
                >
                    Thêm bước mới
                </button>
            </div>
        </form>
    );
};

export default ProcessForm;