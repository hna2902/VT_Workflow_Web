import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axiosClients';
import { getUserStorage, setUserStorage } from '../../utils/storage';
import logo from '../../assets/logo.png'; 
import defaultAvatar from '../../assets/default-avatar.png'; 
import { 
    FaBell, 
    FaCog, 
    FaSignOutAlt, 
    FaListAlt,
    FaAngleDown,
    FaCalendarAlt,
    FaBellSlash
} from 'react-icons/fa';

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const role = getUserStorage('user_role', 'User');
    const name = getUserStorage('user_name', 'Bạn');
    const displayDate = getUserStorage('user_created_at', 'Mới đây');
    
    const [isNotifEnabled, setIsNotifEnabled] = useState(
        getUserStorage('user_notif_enabled', 'false') === 'true'
    );
    
    const [userAvatar, setAvatar] = useState(
        getUserStorage('user_avatar', defaultAvatar)
    );
    
    const displayRole = role === 'Admin' ? 'Quản trị viên' : 'Người dùng';

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Listen for avatar updates across the app
    useEffect(() => {
        const handleAvatarChange = () => {
            setAvatar(getUserStorage('user_avatar', defaultAvatar));
        };
        window.addEventListener('avatarUpdated', handleAvatarChange);
        return () => {
            window.removeEventListener('avatarUpdated', handleAvatarChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
    };

    const handleToggleNotif = async (e) => {
        e.stopPropagation();
        const previousState = isNotifEnabled;
        const newState = !previousState;
        
        setIsNotifEnabled(newState);
        setUserStorage('user_notif_enabled', String(newState));

        try {
            await axiosClient.patch('users/toggle-notif/', {});
        } catch (error) {
            console.error("Error updating notification status:", error);
            setIsNotifEnabled(previousState);
            setUserStorage('user_notif_enabled', String(previousState));
            alert("Không thể cập nhật trạng thái thông báo!");
        }
    };

    return (
        <header className="relative z-50 flex items-center justify-between px-6 py-3 bg-gradient-to-r from-white to-blue-700 border-b border-slate-300 shrink-0 shadow-sm">
            
            {/* Logo */}
            <Link to="/home" className="flex items-center h-10 cursor-pointer group">
                <img src={logo} alt="VT Logo" className="object-contain h-full mr-2 group-hover:scale-105 transition-transform" />
                <span className="text-xl font-bold text-blue-800">
                    <span className="text-red-600">VT</span> Workflow
                </span>
            </Link>
            
            {/* Right Side */}
            <div className="flex items-center gap-6">
                
                {/* Notification Bell */}
                <button className="relative flex items-center justify-center w-10 h-10 text-white rounded-full cursor-pointer hover:bg-white/20 transition-colors">
                    <FaBell className="text-lg" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 border border-blue-700 rounded-full bg-red-500"></span>
                </button>
                
                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <span className="font-medium text-white select-none">{name}</span>
                        <div className="flex items-center gap-1">
                            <img 
                                src={userAvatar} 
                                alt="User Avatar" 
                                className="w-9 h-9 object-cover rounded-full border-2 border-white/50 shadow-sm" 
                            />
                            <FaAngleDown className={`text-white/80 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {/* Bảng Menu Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-4 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden transform origin-top-right transition-all flex flex-col">
                            
                            {/* KHU VỰC 1: THÔNG TIN */}
                            <div className="px-5 py-4 bg-slate-50/80">
                                {/* Vai trò */}
                                <div className="mb-4">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Vai trò hiện tại</p>
                                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        {displayRole}
                                        {role === 'Admin' && <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-red-100 text-red-600 rounded-full">Admin</span>}
                                    </p>
                                </div>
                                {/* Ngày tham gia */}
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ngày tham gia</p>
                                    {/* Nhốt Icon lịch vào hộp w-7 để thẳng hàng tuyệt đối với các nút bên dưới */}
                                    <p className="text-sm font-medium text-slate-600 flex items-center">
                                        <div className="w-7 flex justify-start text-slate-400">
                                            <FaCalendarAlt className="text-lg" />
                                        </div>
                                        <span>{displayDate}</span>
                                    </p>
                                </div>
                            </div>

                            {/* ĐƯỜNG KẺ 1 (Dùng div riêng thay vì border để kiểm soát 100% độ dày) */}
                            <div className="h-px bg-slate-100 w-full"></div>

                            {/* KHU VỰC 2: MENU ĐIỀU HƯỚNG */}
                            <Link to="/notifications" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-5 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                {/* Hộp nhốt Icon */}
                                <div className="w-7 flex justify-start text-slate-400">
                                    <FaListAlt className="text-lg" />
                                </div>
                                <span>Trung tâm thông báo</span>
                            </Link>
                            {/* Notification button */}
                            <button 
                                onClick={handleToggleNotif} // Gọi hàm API ở đây
                                className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center">
                                    <div className="w-7 flex justify-start text-slate-400">
                                        {isNotifEnabled ? <FaBell className="text-lg" /> : <FaBellSlash className="text-lg" />}
                                    </div>
                                    <span>Thông báo</span>
                                </div>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${isNotifEnabled ? 'bg-blue-500' : 'bg-slate-200'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${isNotifEnabled ? 'left-4.5 right-0.5' : 'left-0.5'}`}></div>
                                </div>
                            </button>
                            <Link to="/information" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-5 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                {/* Hộp nhốt Icon */}
                                <div className="w-7 flex justify-start text-slate-400">
                                    <FaCog className="text-lg" />
                                </div>
                                <span>Tài khoản</span>
                            </Link>

                            {/* ĐƯỜNG KẺ 2 */}
                            <div className="h-px bg-slate-100 w-full"></div>

                            {/* KHU VỰC 3: ĐĂNG XUẤT */}
                            {/* Dùng text-left để ép thẻ button vô kỷ luật phải tuân thủ lề */}
                            <button 
                                onClick={handleLogout}
                                // SỬA: Thêm cursor-pointer và đổi hover:bg-red-50 thành hover:bg-red-100
                                className="w-full flex items-center text-left px-5 py-3.5 text-sm font-bold text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer"
                            >
                                {/* Hộp nhốt Icon */}
                                <div className="w-7 flex justify-start text-red-600">
                                    <FaSignOutAlt className="text-lg" />
                                </div>
                                <span>Đăng xuất</span>
                            </button>

                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;