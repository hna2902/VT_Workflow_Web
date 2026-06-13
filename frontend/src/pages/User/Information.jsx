import React, { useState, useRef } from 'react';
import axios from 'axios';
import defaultAvatar from '../../assets/default-avatar.png';
import ChangePasswordForm from './ChangePasswordForm';
import Modal from '../../components/common/Modal';
import { 
    FaCamera, 
    FaCalendarAlt, 
    FaLock, 
    FaPen, 
    FaAt, 
    FaRegUserCircle, 
    FaRegCheckCircle,
    FaCheckCircle,
    FaTimesCircle,
    FaCheck,
    FaTimes
} from 'react-icons/fa';

const Information = () => {
    
    const role = localStorage.getItem('user_role') || sessionStorage.getItem('user_role') || 'User';
    const username = localStorage.getItem('user_username') || sessionStorage.getItem('user_username') || 'username';
    const fileInputRef = useRef(null);
    const createdAt = localStorage.getItem('user_created_at') || sessionStorage.getItem('user_created_at') || 'Mới đây';
    const initialNotifState = localStorage.getItem('user_notif_enabled') === 'true' || sessionStorage.getItem('user_notif_enabled') === 'true';
    const initialAvatar = localStorage.getItem('user_avatar') || sessionStorage.getItem('user_avatar') || defaultAvatar;
    
    const [isNotifEnabled, setIsNotifEnabled] = useState(initialNotifState);
    const [avatar, setAvatar] = useState(initialAvatar);
    const [alertModal, setAlertModal] = useState({isOpen: false,title: '',message: '',type: 'info'});
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    // Name State
    const [name, setName] = useState(localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || 'Người dùng');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    // Email State
    const [email, setEmail] = useState(localStorage.getItem('user_email') || sessionStorage.getItem('user_email') || 'Chưa cập nhật email');
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [tempEmail, setTempEmail] = useState('');

    const showAlert = (title, message, type = 'info') => {setAlertModal({ isOpen: true, title, message, type });};
    const closeAlert = () => {setAlertModal({ ...alertModal, isOpen: false });};

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {

        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showAlert("Thất bại", "Vui lòng chọn đúng định dạng", "error");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showAlert("Thất bại", "Vui lòng chọn ảnh nhỏ hơn 2MB", "error");
            return;
        }

        const previousAvatar = avatar;
        const tempUrl = URL.createObjectURL(file);
        setAvatar(tempUrl); 
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
            const response = await axios.patch('http://localhost:8000/api/users/update-avatar/', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            let serverAvatarUrl = response.data.avatar;
            if (!serverAvatarUrl.startsWith('http')) {
                serverAvatarUrl = 'http://localhost:8000' + serverAvatarUrl;
            }
            setAvatar(serverAvatarUrl); 
            localStorage.setItem('user_avatar', serverAvatarUrl);
            sessionStorage.setItem('user_avatar', serverAvatarUrl);
            window.dispatchEvent(new Event('avatarUpdated'));
            showAlert("Thành công", "Cập nhật ảnh đại diện thành công", "success");

        } catch (error) {
            console.error("Lỗi Upload Avatar:", error);
            setAvatar(previousAvatar);
            showAlert("Upload thất bại", "Không thể upload ảnh đại diện. Vui lòng thử lại", "error");
        } finally {
            event.target.value = null;
        }
    };

    const handleToggleNotif = async () => {
        const previousState = isNotifEnabled;
        const newState = !previousState;
        setIsNotifEnabled(newState);
        localStorage.setItem('user_notif_enabled', newState.toString());
        sessionStorage.setItem('user_notif_enabled', newState.toString());
        try {
            const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
            await axios.patch('http://localhost:8000/api/users/toggle-notif/', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật thông báo:", error);
            setIsNotifEnabled(previousState);
            localStorage.setItem('user_notif_enabled', previousState.toString());
            sessionStorage.setItem('user_notif_enabled', previousState.toString());
            showAlert("Lỗi hệ thống", "Không thể cập nhật trạng thái thông báo!", "error");
        }
    };

    const handleUpdateNameInline = async () => {
        if (!tempName.trim()) {
            showAlert("Lỗi", "Tên không được để trống!", "error");
            return;
        }
        try {
            const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
            const response = await axios.patch('http://localhost:8000/api/users/update-name/', 
                { name: tempName }, { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Success: Update real state, storage, and close edit mode
            setName(response.data.name);
            localStorage.setItem('user_name', response.data.name);
            sessionStorage.setItem('user_name', response.data.name);
            setIsEditingName(false);
            showAlert("Thành công", "Đã cập nhật tên hiển thị!", "success");
        } catch (error) {
            showAlert("Lỗi", "Không thể cập nhật tên!", "error");
        }
    };

    const handleUpdateEmailInline = async () => {
        if (!tempEmail.trim()) return;
        try {
            const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
            const response = await axios.patch('http://localhost:8000/api/users/update-email/', 
                { email: tempEmail }, { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setEmail(response.data.email);
            localStorage.setItem('user_email', response.data.email);
            sessionStorage.setItem('user_email', response.data.email);
            setIsEditingEmail(false);
            showAlert("Thành công", "Đã cập nhật địa chỉ Email!", "success");
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Không thể cập nhật Email!";
            showAlert("Lỗi", errorMsg, "error");
        }
    };

    const handleUpdatePassword = async (passwords) => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            showAlert("Lỗi nhập liệu", "Mật khẩu mới và xác nhận mật khẩu không khớp nhau!", "error");
            return;
        }
        try {
            const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
            const response = await axios.patch('http://localhost:8000/api/users/change-password/', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsPasswordModalOpen(false);
            showAlert("Thành công", "Đổi mật khẩu thành công! Vui lòng dùng mật khẩu mới cho lần đăng nhập sau.", "success");

        } catch (error) {
            console.error("Lỗi đổi mật khẩu:", error);
            if (error.response && error.response.data && error.response.data.error) {
                const backendError = error.response.data.error;
                if (backendError === "Incorrect current password") {
                    showAlert("Lỗi xác thực", "Mật khẩu hiện tại bạn nhập không chính xác!", "error");
                } else {
                    showAlert("Lỗi thao tác", backendError, "error");
                }
            } else {
                showAlert("Lỗi hệ thống", "Không thể kết nối đến máy chủ. Vui lòng thử lại sau!", "error");
            }
        }
    };

    const InfoCard = ({ icon: Icon, label, value, color, actionElement }) => (
        <div className="flex items-center gap-4 p-4 sm:p-5 bg-white rounded-3xl border border-slate-500 shadow-sm hover:shadow-md transition-all group">
            <div className={`p-3 sm:p-4 rounded-2xl shrink-0 ${color.bg} ${color.text}`}>
                <Icon className="text-xl sm:text-2xl" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{label}</p>
                <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 break-words">{value}</p>
            </div>
            {/* Nếu có truyền vào nút bấm/công tắc thì sẽ hiển thị ở đây */}
            {actionElement && (
                <div className="shrink-0 pl-2">
                    {actionElement}
                </div>
            )}
        </div>
    );

    return (
        <>
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-10">
            
                <div className="pb-4 border-b border-slate-200">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Hồ sơ cá nhân</h1>
                    <p className="text-slate-500 text-sm sm:text-base mt-1 font-medium">Xem và quản lý thông tin tài khoản, cài đặt bảo mật của bạn tại đây.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
                    <div className="md:col-span-1 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
                        <div className="relative mb-4 sm:mb-6">
                            <div className="p-2 bg-white rounded-full shadow-inner border border-slate-100 group cursor-pointer" onClick={handleAvatarClick}>
                                <img 
                                    src={avatar} 
                                    alt="User Avatar" 
                                    className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full bg-slate-100 group-hover:opacity-90 transition-opacity"
                                />
                                {/* Camera Button */}
                                <button className="absolute bottom-1 right-1 p-2.5 sm:p-3 bg-white rounded-full shadow-lg border border-slate-100 text-blue-600 hover:scale-110 hover:bg-blue-50 transition-all active:scale-95 cursor-pointer">
                                    <FaCamera size={16} />
                                </button>
                            </div>
                        </div>
                        {isEditingName ? (
                        // REASON: Edit Mode - Shows an input field with Save and Cancel buttons
                        <div className="flex items-center justify-center gap-2 px-4 mt-2 w-full">
                            <input 
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                autoFocus
                                className="w-full text-xl sm:text-2xl font-extrabold text-slate-900 text-center bg-slate-50 border-b-2 border-blue-500 focus:outline-none rounded-t-md px-1"
                            />
                            <button onClick={handleUpdateNameInline} className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-full shadow-sm active:scale-95 transition-all">
                                <FaCheck size={12} />
                            </button>
                            <button onClick={() => setIsEditingName(false)} className="p-2 text-slate-500 bg-slate-200 hover:bg-slate-300 rounded-full shadow-sm active:scale-95 transition-all">
                                <FaTimes size={12} />
                            </button>
                        </div>
                        ) : (
                            // View Mode - Shows normal text and Pen icon
                            <div className="flex items-center justify-center gap-2 px-4 mt-2">
                                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 text-center break-all">{name}</h2>
                                <button 
                                    onClick={() => { setTempName(name); setIsEditingName(true); }}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all cursor-pointer shrink-0"
                                >
                                    <FaPen size={14} />
                                </button>
                            </div>
                        )}
                        <p className="text-slate-400 font-semibold text-sm sm:text-base mt-0.5 break-all">@{username}</p>
                        <div className={`mt-4 px-4 sm:px-5 py-1 sm:py-1.5 rounded-full ${
                            role === 'Admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            <span className="text-xs font-black uppercase tracking-widest">
                                {role === 'Admin' ? 'Quản trị viên' : 'Người dùng'}
                            </span>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <InfoCard 
                                icon={FaAt} label="Địa chỉ Email"
                                color={{bg: "bg-blue-50", text: "text-blue-600"}}
                                // Nếu đang edit thì hiện ô Input, ngược lại hiện text bình thường
                                value={
                                    isEditingEmail ? (
                                        <input 
                                            type="email"
                                            value={tempEmail}
                                            onChange={(e) => setTempEmail(e.target.value)}
                                            autoFocus
                                            className="w-full text-base sm:text-lg font-extrabold text-slate-900 bg-blue-50/50 border-b-2 border-blue-500 focus:outline-none px-1 rounded-t-sm"
                                        />
                                    ) : (
                                        email
                                    )
                                }
                                actionElement={
                                    isEditingEmail ? (
                                        // REASON: Action buttons for Edit Mode (Save / Cancel)
                                        <div className="flex gap-1">
                                            <button onClick={handleUpdateEmailInline} className="p-1.5 text-white bg-green-500 hover:bg-green-600 rounded-full shadow-sm active:scale-95 transition-all">
                                                <FaCheck size={12} />
                                            </button>
                                            <button onClick={() => setIsEditingEmail(false)} className="p-1.5 text-slate-500 bg-slate-200 hover:bg-slate-300 rounded-full shadow-sm active:scale-95 transition-all">
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        // Action button for View Mode (Pen icon)
                                        <button 
                                            onClick={() => { setTempEmail(email); setIsEditingEmail(true); }}
                                            className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all cursor-pointer"
                                        >
                                            <FaPen size={20} />
                                        </button>
                                    )
                                }
                            />

                            <InfoCard 
                                icon={FaRegUserCircle}
                                    label="Tài khoản đăng nhập"
                                    value={username}
                                    color={{bg: "bg-slate-100", text: "text-slate-600"}}
                            />

                            <InfoCard 
                                icon={FaCalendarAlt}
                                    label="Ngày tham gia"
                                    value={createdAt}
                                    color={{bg: "bg-green-50", text: "text-green-600"}}
                            />

                            <InfoCard 
                                    icon={FaRegCheckCircle}
                                    label="Trạng thái thông báo"
                                    value={isNotifEnabled ? "Đang bật" : "Đã tắt"}
                                    color={{
                                        bg: isNotifEnabled ? "bg-amber-50" : "bg-slate-100", 
                                        text: isNotifEnabled ? "text-amber-600" : "text-slate-600"
                                    }}
                                    actionElement={
                                        <button 
                                            onClick={handleToggleNotif}
                                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer"
                                            style={{ backgroundColor: isNotifEnabled ? '#3b82f6' : '#cbd5e1' }} // Xanh blue-500 hoặc xám slate-300
                                        >
                                            <span 
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                                                    isNotifEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    }
                                />
                                
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-sm text-slate-500 border border-slate-100 shrink-0">
                                    <FaLock className="text-lg sm:text-xl" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-800">Cài đặt mật khẩu</p>
                                    <p className="text-xs sm:text-sm text-slate-500 font-medium">Bạn nên đổi mật khẩu định kỳ để bảo mật tài khoản.</p>
                                </div>        
                            </div>
                            <button 
                                onClick={() => setIsPasswordModalOpen(true)} // Mở Modal Password
                                className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all cursor-pointer"
                            >
                                Đổi mật khẩu
                            </button>
                        </div>  
                    </div>
                </div>
            </div>

            <Modal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
                title="Đổi mật khẩu bảo mật"
            >
                <ChangePasswordForm 
                    onClose={() => setIsPasswordModalOpen(false)} 
                    onSubmit={handleUpdatePassword} 
                />
            </Modal>

            <Modal 
                isOpen={alertModal.isOpen} 
                onClose={closeAlert} 
                title={alertModal.title}
            >
                <div className="flex flex-col items-center py-6 px-4">
                    {alertModal.type === 'success' ? (
                        <FaCheckCircle className="text-6xl text-green-500 mb-4 animate-bounce" />
                    ) : (
                        <FaTimesCircle className="text-6xl text-red-500 mb-4 animate-bounce" />
                    )}
                    
                    <p className="text-lg font-semibold text-slate-800 mb-6 text-center leading-relaxed">
                        {alertModal.message}
                    </p>
                    
                    <button 
                        onClick={closeAlert}
                        className="px-8 py-2.5 bg-slate-800 text-white font-bold rounded-xl shadow-sm hover:bg-slate-900 active:scale-95 transition-all w-full sm:w-auto"
                    >
                        Đã hiểu
                    </button>
                    
                </div>
            </Modal>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" // Dùng class hidden của Tailwind cho gọn
            />
        </>
    );
};

export default Information;