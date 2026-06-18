import React, { useState, useEffect, useRef} from 'react';
import axiosClient from '../../../utils/axiosClients';
import { 
    FaChevronDown
} from 'react-icons/fa';
const CategoryForm = ({ onSuccess, onClose, showAlert }) => {
    const [formData, setFormData] = useState({
        title: '',
        leader: '', 
        status: 'Active'
    });
    const [users, setUsers] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const formRef = useRef(null);
    
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosClient.get('users/');
                setUsers(response.data);
            } catch (err) {
                console.error("Không lấy được danh sách nhân viên", err);
            }
        };
        fetchUsers();
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (formRef.current && !formRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectOption = (name, value) => {
        setFormData({ ...formData, [name]: value });
        setOpenDropdown(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            leader: formData.leader === '' ? null : formData.leader
        };

        try {
            await axiosClient.post('processes/categories/', payload);
            onSuccess(); 
            
        } catch (err) {
            console.error("Lỗi khi thêm danh mục:", err);
            const errorMessage = err.response?.data?.title?.[0] || err.response?.data?.error || "Vui lòng kiểm tra lại dữ liệu nhập vào!";
            showAlert("Thêm thất bại", errorMessage, "error");
        }
    };

    const selectedLeader = users.find(u => u.id === formData.leader) || { name: '-- Chọn nhân viên (Không bắt buộc) --' };
    const leaderDisplayName = selectedLeader.name || selectedLeader.username || '-- Chọn nhân viên (Không bắt buộc) --';
    const statusOptions = [
        { value: 'Active', label: 'Hoạt động (Active)' },
        { value: 'Inactive', label: 'Ẩn (Inactive)' }
    ];
    const selectedStatusLabel = statusOptions.find(opt => opt.value === formData.status)?.label;

    return (
        <form ref={formRef} id="category-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Title Field */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên danh mục <span className="text-red-500">*</span></label>
                {/* REASON: text-base on mobile prevents iOS Safari auto-zoom. sm:text-sm scales it back for desktop. py-3 makes the tap area larger on mobile. */}
                <input 
                    type="text" name="title" required value={formData.title} onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 font-medium shadow-sm transition-all"
                    placeholder="Ví dụ: Thiết bị mạng"
                />
            </div>

            <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Người quản lý (Leader)</label>
                
                <div 
                    onClick={() => setOpenDropdown(openDropdown === 'leader' ? null : 'leader')}
                    className={`w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border rounded-xl flex justify-between items-center bg-white shadow-sm transition-all cursor-pointer select-none
                        ${openDropdown === 'leader' ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'}
                    `}
                >
                    <span className={`font-medium truncate pr-4 ${formData.leader === '' ? 'text-slate-500' : 'text-slate-800'}`}>
                        {leaderDisplayName}
                    </span>
                    <FaChevronDown className={`shrink-0 text-slate-400 transition-transform duration-200 ${openDropdown === 'leader' ? 'rotate-180 text-blue-500' : ''}`} />
                </div>

                {openDropdown === 'leader' && (
                    <div className="absolute z-[60] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 sm:max-h-60 overflow-y-auto overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <ul className="py-2">
                            <li 
                                onClick={() => handleSelectOption('leader', '')}
                                className={`px-4 py-3 sm:py-2.5 text-base sm:text-sm cursor-pointer font-medium transition-colors hover:bg-blue-50 hover:text-blue-700 ${formData.leader === '' ? 'bg-blue-50/50 text-blue-600' : 'text-slate-600'}`}
                            >
                                -- Không chọn Leader --
                            </li>
                            {users.map(user => (
                                <li 
                                    key={user.id} 
                                    onClick={() => handleSelectOption('leader', user.id)}
                                    className={`px-4 py-3 sm:py-2.5 text-base sm:text-sm cursor-pointer font-medium transition-colors hover:bg-blue-50 hover:text-blue-700 ${formData.leader === user.id ? 'bg-blue-50/50 text-blue-600' : 'text-slate-700'}`}
                                >
                                    {user.name || user.username}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trạng thái</label>
                
                <div 
                    onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                    className={`w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border rounded-xl flex justify-between items-center bg-white shadow-sm transition-all cursor-pointer select-none
                        ${openDropdown === 'status' ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'}
                    `}
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
                                    onClick={() => handleSelectOption('status', opt.value)}
                                    className={`px-4 py-3 sm:py-2.5 text-base sm:text-sm cursor-pointer font-medium transition-colors hover:bg-blue-50 hover:text-blue-700 ${formData.status === opt.value ? 'bg-blue-50/50 text-blue-600' : 'text-slate-700'}`}
                                >
                                    {opt.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-5 mt-2 border-t border-slate-200">
                <button type="button" onClick={onClose} className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 border-2 border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-200 hover:text-slate-800 hover:border-slate-500 transition-all cursor-pointer">
                    Hủy
                </button>
                <button type="submit" className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all cursor-pointer">
                    Lưu thay đổi
                </button>
            </div>
        </form>
    );
};

export default CategoryForm;