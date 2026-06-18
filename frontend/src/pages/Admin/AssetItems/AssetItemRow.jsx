import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Bổ sung useNavigate
import { FaImage } from 'react-icons/fa';

const AssetItemRow = ({ item, onSave, onDelete }) => {
    const navigate = useNavigate(); // 2. Khởi tạo navigate

    const [isEditing, setIsEditing] = useState(false);
    const [localTitle, setLocalTitle] = useState(item.title);
    const [localStatus, setLocalStatus] = useState(item.status);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:8000${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setLocalTitle(item.title);
        setLocalStatus(item.status);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setLocalTitle(item.title);
        setLocalStatus(item.status);
    };

    const handleSaveClick = () => {
        onSave(item.id, { title: localTitle, status: localStatus });
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between p-4 transition-colors bg-white border border-l-4 border-slate-300 border-l-blue-500 rounded shadow-sm hover:bg-slate-50 gap-4 sm:gap-6">
            
            {/* Cột Ảnh thu nhỏ */}
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center">
                {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                    <FaImage className="text-slate-300 text-2xl" />
                )}
            </div>

            <div className="flex-1 w-full mr-0 sm:mr-4">
                {isEditing ? (
                    <div className="flex flex-col gap-3 w-full sm:max-w-sm mt-1">
                        <input 
                            type="text" 
                            value={localTitle} 
                            onChange={(e) => setLocalTitle(e.target.value)}
                            className="w-full px-3 py-2 sm:py-1.5 text-base sm:text-sm font-bold text-slate-800 bg-white border rounded outline-none border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all" 
                            autoFocus 
                            placeholder="Tên tài sản"
                        />
                        
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-semibold text-slate-700">Trạng thái:</span>
                            <button 
                                type="button"
                                onClick={() => setLocalStatus(localStatus === 'Active' ? 'Inactive' : 'Active')}
                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer"
                                style={{ backgroundColor: localStatus === 'Active' ? '#22c55e' : '#ef4444' }} 
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${localStatus === 'Active' ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className={`text-sm font-medium transition-colors duration-300 ${localStatus === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                                {localStatus === 'Active' ? 'Hoạt động' : 'Ẩn'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="mt-1">
                        <h3 
                            onClick={() => navigate(`/admin/assets/${item.id}/workflows`)} // Đổi URL này cho khớp với Route bạn đã cấu hình bên App.jsx nhé!
                            className="text-lg font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer break-words w-fit transition-colors"
                        >
                            {item.title}
                        </h3>
                        
                        <p className="text-sm text-slate-500 mt-1">
                            Trạng thái: 
                            <span className={`ml-1 font-medium ${item.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                                {item.status}
                            </span>
                        </p>
                    </div>
                )}
            </div>
            
            <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-20 mt-3 sm:mt-0">
                {isEditing ? (
                    <>
                        <button onClick={handleSaveClick} className="flex-1 sm:flex-none px-4 py-2 sm:py-1 text-sm font-bold text-white transition-colors bg-green-600 hover:bg-green-700 rounded shadow-sm cursor-pointer">Lưu</button>
                        <button onClick={handleCancelClick} className="flex-1 sm:flex-none px-4 py-2 sm:py-1 text-sm font-bold text-slate-600 transition-colors bg-slate-200 hover:bg-slate-300 rounded shadow-sm cursor-pointer">Hủy</button>
                    </>
                ) : (
                    <>
                        <button onClick={handleEditClick} className="flex-1 sm:flex-none px-4 py-2 sm:py-1 text-sm font-bold text-blue-700 transition-colors bg-blue-100 hover:bg-blue-200 rounded shadow-sm cursor-pointer">Sửa</button>
                        <button onClick={() => onDelete(item)} className="flex-1 sm:flex-none px-4 py-2 sm:py-1 text-sm font-bold text-red-700 transition-colors bg-red-100 hover:bg-red-200 rounded shadow-sm cursor-pointer">Xóa</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AssetItemRow;