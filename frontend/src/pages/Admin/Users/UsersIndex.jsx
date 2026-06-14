import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../../utils/axiosClients';
import { 
    FaUserCircle,
    FaAt,
    FaCalendarAlt,
    FaEye,
    FaEyeSlash,
    FaChevronDown
} from 'react-icons/fa';
import AdminIndexLayout from '../../../components/layout/AdminIndexLayout';
import Modal from '../../../components/common/Modal';
import { getSessionStorage } from '../../../utils/storage';

const UserRow = ({ user, categories, onSave, onDelete }) => {
    const [localRole, setLocalRole] = useState(user.role || 'User');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null); 
    const managedCategory = categories.find(c => c.leader === user.id);
    const [localLeader, setLocalLeader] = useState(managedCategory ? managedCategory.id : '');
    const rowRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (rowRef.current && !rowRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedCategoryName = categories.find(c => c.id === localLeader)?.title;
    const handleUpdate = () => {
        const payload = {
            role: localRole,
            leader_id: localLeader === '' ? null : localLeader,
            ...(password && { password })
        };
        onSave(user.id, payload);
        setPassword('');
    };

    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return null;
        if (avatarPath.startsWith('http')) return avatarPath;
        if (avatarPath.includes('media/')) {
            const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
            return `http://localhost:8000${cleanPath}`;
        }
        
        const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
        return `http://localhost:8000/media${cleanPath}`;
    };

    return (
        <>
            <div ref={rowRef} className="flex flex-col lg:flex-row lg:items-start justify-between p-5 transition-colors bg-white border border-l-4 border-slate-300 border-l-blue-500 rounded-xl shadow-sm hover:bg-slate-50 gap-6">
                {/* CỘT 1: Avatar, Role Dropdown & Thông tin cứng */}
                <div className="flex items-start gap-4 lg:w-1/3">
                    <div className="flex flex-col items-center gap-2 shrink-0 w-20">
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 shadow-sm shrink-0">
                            {user.avatar ? (
                                <img 
                                    src={getAvatarUrl(user.avatar)} 
                                    alt="avatar" 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <FaUserCircle className="w-full h-full text-slate-300 bg-white" />
                            )}
                        </div>
                        
                        {/* DROPDOWN: Chỉnh Role (Nằm dưới Avatar) */}
                        <div className="relative w-full">
                            <div 
                                onClick={() => setOpenDropdown(openDropdown === 'role' ? null : 'role')}
                                className={`flex items-center justify-between px-2 py-1 text-xs font-bold uppercase tracking-wide rounded cursor-pointer border shadow-sm transition-all select-none ${
                                    localRole === 'Admin' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                }`}
                            >
                                <span className="truncate">{localRole}</span>
                                <FaChevronDown size={10} className={`shrink-0 transition-transform ${openDropdown === 'role' ? 'rotate-180' : ''}`} />
                            </div>

                            {openDropdown === 'role' && (
                                <div className="absolute z-50 w-24 mt-1 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                    <div onClick={() => { setLocalRole('User'); setOpenDropdown(null); }} className={`px-3 py-2 text-xs font-bold cursor-pointer hover:bg-slate-50 ${localRole === 'User' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}>USER</div>
                                    <div onClick={() => { setLocalRole('Admin'); setOpenDropdown(null); }} className={`px-3 py-2 text-xs font-bold cursor-pointer hover:bg-slate-50 ${localRole === 'Admin' ? 'text-red-600 bg-red-50/50' : 'text-slate-600'}`}>ADMIN</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1">
                        <h3 className="text-lg font-bold text-slate-800 break-words">{user.name || user.username}</h3>
                        <p className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                            <FaAt className="text-slate-400" /> {user.email}
                        </p>
                        <p className="text-sm text-slate-500 font-medium">@{user.username}</p>
                        {user.date_joined && (
                            <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                <FaCalendarAlt /> Tham gia: {new Date(user.date_joined).toLocaleDateString('vi-VN')}
                            </p>
                        )}
                    </div>
                </div>

                {/* CỘT 2: Nhập Password mới & Chọn Leader */}
                <div className="flex-1 flex flex-col sm:flex-row gap-4 pt-1">
                    {/* Đổi mật khẩu */}
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Đổi mật khẩu</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all"
                                placeholder="********" 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors p-1 cursor-pointer"
                            >
                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Giao phụ trách (Leader) */}
                    <div className="flex-1 relative">
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Giao phụ trách</label>
                        <div 
                            onClick={() => setOpenDropdown(openDropdown === 'leader' ? null : 'leader')}
                            className={`flex items-center justify-between w-full px-4 py-2.5 text-sm bg-white border rounded-xl cursor-pointer transition-all select-none ${openDropdown === 'leader' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-300 hover:border-slate-400'}`}
                        >
                            <span className={`font-medium truncate pr-2 ${localLeader === '' ? 'text-slate-400' : 'text-slate-800'}`}>
                                {selectedCategoryName || '-- Trống --'}
                            </span>
                            <FaChevronDown className={`text-slate-400 shrink-0 transition-transform ${openDropdown === 'leader' ? 'rotate-180 text-blue-500' : ''}`} />
                        </div>

                        {openDropdown === 'leader' && (
                            <div className="absolute z-[60] w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-1">
                                <div 
                                    onClick={() => { setLocalLeader(''); setOpenDropdown(null); }} 
                                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${localLeader === '' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50 font-medium'}`}
                                >
                                    -- Trống (Không phụ trách) --
                                </div>
                                {categories.map(cat => (
                                    <div 
                                        key={cat.id} 
                                        onClick={() => { setLocalLeader(cat.id); setOpenDropdown(null); }} 
                                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors truncate ${localLeader === cat.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}
                                    >
                                        {cat.title}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* CỘT 3: Các Nút Hành Động */}
                <div className="flex flex-row lg:flex-col gap-2 shrink-0 lg:w-24 mt-4 lg:mt-0 pt-1">
                    <button 
                        onClick={handleUpdate} 
                        className="flex-1 lg:flex-none w-full px-4 py-2.5 text-sm font-bold text-white transition-all bg-green-600 rounded-xl shadow-sm hover:bg-green-700 active:scale-95 cursor-pointer"
                    >
                        Lưu
                    </button>
                    <button 
                        onClick={() => onDelete(user.id)}
                        className="flex-1 lg:flex-none w-full px-4 py-2.5 text-sm font-bold text-red-700 transition-all bg-red-100 rounded-xl hover:bg-red-200 active:scale-95 cursor-pointer"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </>
    );
};

const UsersIndex = () => {
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null, requiresPass: false });
    const [confirmPassword, setConfirmPassword] = useState('');
    const showAlert = (title, message, type) => setAlertConfig({ isOpen: true, title, message, type });
    const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });


    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [usersRes, categoriesRes] = await Promise.all([
                    axiosClient.get('users/'),
                    axiosClient.get('processes/categories/')
                ]);
                setUsers(usersRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                showAlert("Lỗi", "Không thể tải dữ liệu!", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleVerifySuccess = () => {
        setUserStorage('is_delete_authorized', 'true');
    };

    const checkAuthStatus = () => {
        return getUserStorage('is_delete_authorized', 'false') === 'true';
    };


    const handleSaveUser = async (id, payload) => {
        try {
            await axiosClient.patch(`users/${id}/`, payload);
            setUsers(users.map(u => u.id === id ? { ...u, ...payload } : u));
            showAlert("Thành công", "Đã lưu cài đặt tài khoản!", "success");
        } catch (error) {
            const errorMsg = error.response?.data?.detail || "Có lỗi xảy ra khi lưu!";
            showAlert("Lỗi cập nhật", errorMsg, "error");
        }
    };

    const handleDeleteUser = (user) => {
    // Kiểm tra cờ bảo mật trong sessionStorage (dùng getSessionStorage của sếp)
    const isAuthorized = getSessionStorage('is_delete_authorized', 'false') === 'true';
        setDeleteModal({
            isOpen: true,
            user: user,
            requiresPass: !isAuthorized
        });
    };

    // Hàm thực thi xóa sau khi xác nhận
    const executeDelete = async () => {
        try {
            if (deleteModal.requiresPass) {
                // API verify mật khẩu
                await axiosClient.post('users/verify-password/', { password: confirmPassword });
                setSessionStorage('is_delete_authorized', 'true');
            }

            // Gọi API xóa
            await axiosClient.delete(`users/${deleteModal.user.id}/`);
            
            // Cập nhật giao diện
            setUsers(users.filter(u => u.id !== deleteModal.user.id));
            setDeleteModal({ isOpen: false, user: null, requiresPass: false });
            setConfirmPassword('');
            showAlert("Thành công", "Đã xóa người dùng!", "success");
        } catch (error) {
            showAlert("Lỗi", error.response?.data?.detail || "Xóa thất bại!", "error");
        }
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (user.name && user.name.toLowerCase().includes(searchLower)) ||
            (user.username && user.username.toLowerCase().includes(searchLower)) ||
            (user.email && user.email.toLowerCase().includes(searchLower))
        );
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <AdminIndexLayout
            searchPlaceholder="Tìm kiếm Tên, Username hoặc Email..."
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            loading={loading}
            items={currentItems}
            renderItem={(user) => (
                <UserRow 
                    key={user.id} 
                    user={user} 
                    categories={categories} 
                    onSave={handleSaveUser} 
                    onDelete={() => handleDeleteUser(user)} 
                />
            )}
            emptyMessage="Không tìm thấy người dùng nào"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        >
            <Modal isOpen={alertConfig.isOpen} onClose={closeAlert} title={alertConfig.title}>
                <div className="text-center pb-4">
                    <p className={`text-lg font-medium ${alertConfig.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{alertConfig.message}</p>
                    <button onClick={closeAlert} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 active:scale-95 transition-colors">Đóng</button>
                </div>
            </Modal>
            <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({...deleteModal, isOpen: false})} title="Xác nhận xóa tài khoản">
                <div className="flex flex-col gap-4 py-4">
                    <p className="text-slate-600">Bạn có chắc chắn muốn xóa tài khoản <b>{deleteModal.user?.name}</b> không? Hành động này không thể hoàn tác.</p>
                    
                    {deleteModal.requiresPass && (
                        <input 
                            type="password" 
                            placeholder="Nhập mật khẩu Admin để xác thực"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    )}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-5 mt-2 border-t border-slate-200">
                        <button 
                            type="button" 
                            onClick={() => setDeleteModal({...deleteModal, isOpen: false})} // Đóng Modal
                            className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 border-2 border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-200 hover:text-slate-800 hover:border-slate-500 transition-all cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={executeDelete} 
                            className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-sm hover:bg-red-700 hover:shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                            Xóa vĩnh viễn
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminIndexLayout>
    );
};

export default UsersIndex;