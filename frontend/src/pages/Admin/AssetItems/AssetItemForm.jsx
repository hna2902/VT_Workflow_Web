import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../../utils/axiosClients';
import { FaChevronDown, FaUpload, FaTimes } from 'react-icons/fa';

// REASON: Added initialData prop. If it exists, we are in Edit Mode.
const AssetItemForm = ({ onSuccess, onClose, showAlert, categoryId, initialData }) => {
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('Active');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); 
    
    const [openDropdown, setOpenDropdown] = useState(null);
    const formRef = useRef(null);

    // REASON: Populate form if initialData exists (Edit Mode)
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setStatus(initialData.status || 'Active');
            if (initialData.image) {
                // If the backend returns a relative URL, format it.
                const imgUrl = initialData.image.startsWith('http') 
                    ? initialData.image 
                    : `http://localhost:8000${initialData.image.startsWith('/') ? '' : '/'}${initialData.image}`;
                setImagePreview(imgUrl);
            }
        }
    }, [initialData]);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (formRef.current && !formRef.current.contains(event.target)) setOpenDropdown(null);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file)); 
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = new FormData();
        payload.append('title', title);
        payload.append('status', status);
        payload.append('category', categoryId); 
        
        // Chỉ gửi file ảnh nếu người dùng thực sự chọn ảnh mới
        if (imageFile) {
            payload.append('image', imageFile);
        }

        try {
            if (initialData) {
                // EDIT MODE (PUT)
                await axiosClient.put(`processes/items/${initialData.id}/`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // CREATE MODE (POST)
                await axiosClient.post('processes/items/', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onSuccess(); 
        } catch (err) {
            console.error("Lỗi khi lưu tài sản:", err);
            const errorMessage = err.response?.data?.title?.[0] || err.response?.data?.error || "Vui lòng kiểm tra lại dữ liệu nhập vào!";
            showAlert("Lưu thất bại", errorMessage, "error");
        }
    };

    const statusOptions = [
        { value: 'Active', label: 'Hoạt động (Active)' },
        { value: 'Inactive', label: 'Ẩn (Inactive)' }
    ];
    const selectedStatusLabel = statusOptions.find(opt => opt.value === status)?.label;

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Title Field */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên tài sản <span className="text-red-500">*</span></label>
                <input 
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 font-medium shadow-sm transition-all"
                    placeholder="Ví dụ: Router Wifi..."
                />
            </div>

            {/* Image Field */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hình ảnh tài sản</label>
                {imagePreview ? (
                    <div className="relative w-32 h-32 rounded-xl border border-slate-200 shadow-sm overflow-hidden group">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                            type="button" 
                            onClick={handleRemoveImage}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-slate-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-blue-400 hover:bg-blue-50 focus:outline-none">
                        <span className="flex items-center space-x-2">
                            <FaUpload className="text-slate-400" />
                            <span className="font-medium text-slate-500">Nhấn để tải ảnh lên</span>
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                )}
            </div>

            {/* Status Dropdown */}
            <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trạng thái</label>
                <div 
                    onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                    className={`w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border rounded-xl flex justify-between items-center bg-white shadow-sm transition-all cursor-pointer select-none ${openDropdown === 'status' ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'}`}
                >
                    <span className="font-medium text-slate-800 truncate">{selectedStatusLabel}</span>
                    <FaChevronDown className={`shrink-0 text-slate-400 transition-transform duration-200 ${openDropdown === 'status' ? 'rotate-180 text-blue-500' : ''}`} />
                </div>
                {openDropdown === 'status' && (
                    <div className="absolute z-[60] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <ul className="py-2">
                            {statusOptions.map(opt => (
                                <li 
                                    key={opt.value} 
                                    onClick={() => { setStatus(opt.value); setOpenDropdown(null); }}
                                    className={`px-4 py-3 sm:py-2.5 text-base sm:text-sm cursor-pointer font-medium transition-colors hover:bg-blue-50 hover:text-blue-700 ${status === opt.value ? 'bg-blue-50/50 text-blue-600' : 'text-slate-700'}`}
                                >
                                    {opt.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-5 mt-2 border-t border-slate-200">
                <button type="button" onClick={onClose} className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 border-2 border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-all cursor-pointer">
                    Hủy
                </button>
                <button type="submit" className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 active:scale-95 transition-all cursor-pointer">
                    Lưu thay đổi
                </button>
            </div>
        </form>
    );
};

export default AssetItemForm;