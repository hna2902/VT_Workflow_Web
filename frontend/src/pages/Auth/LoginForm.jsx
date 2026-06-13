import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo.png'; 
import { FaUser, FaLock, FaIdCard, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import Modal from '../../components/common/Modal';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/login/', {
                username: username,
                password: password
            });
            const notifStatus = response.data.user.notif_enabled ?? true;
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('access_token', response.data.access);
            if (response.data.refresh) {
                storage.setItem('refresh_token', response.data.refresh);
            }
            storage.setItem('user_username', response.data.user.username);
            storage.setItem('user_name', response.data.user.name);
            storage.setItem('user_email', response.data.user.email);
            storage.setItem('user_role', response.data.user.role);
            storage.setItem('user_notif_enabled', String(notifStatus));
            storage.setItem('user_created_at', response.data.user.created_at);
            if (response.data.user.avatar) {
                storage.setItem('user_avatar', 'http://localhost:8000' + response.data.user.avatar);
            } else {
                storage.removeItem('user_avatar');
            }

            setIsSuccessModalOpen(true);
            setTimeout(() => {
                navigate('/home');
            }, 1500);
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            setError('Tài khoản hoặc mật khẩu không chính xác!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen">
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop" 
                    alt="Background" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl px-6 lg:px-12 gap-12">
                <div className="flex-1 text-center lg:text-left pt-10 lg:pt-0">
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                        <img src={logo} alt="VT Logo" className="h-16 lg:h-20 object-contain drop-shadow-xl bg-white/10 p-2 rounded-xl backdrop-blur-sm" />
                        <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
                            <span className="text-red-500">VT</span> Workflow
                        </h1>
                    </div>
                    
                    <h2 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight text-white drop-shadow-md">
                        Lên kế hoạch cho hành trình <br className="hidden lg:block"/> công việc của bạn.
                    </h2>
                    <p className="text-lg text-slate-200 leading-relaxed max-w-lg mx-auto lg:mx-0 drop-shadow">
                        Hệ thống quản lý quy trình nghiệp vụ nội bộ, giúp tối ưu hóa thời gian và tăng cường sự phối hợp giữa các phòng ban.
                    </p>
                </div>

                <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
                    
                    <h3 className="text-2xl font-bold text-center text-slate-800 mb-8">
                        Đăng nhập hệ thống
                    </h3>

                    {error && (
                        <div className="p-3 mb-6 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        
                        {/* Username */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaUser />
                            </div>
                            <input 
                                type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập"
                                className="w-full pl-11 pr-4 py-3.5 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaLock />
                            </div>
                            <input 
                                type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu"
                                className="w-full pl-11 pr-4 py-3.5 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        <div className="flex items-center justify-between px-1 mt-2">
                            <label className="flex items-center cursor-pointer group">
                                <input 
                                    type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 transition-colors border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="ml-2 text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                                    Lưu đăng nhập
                                </span>
                            </label>
                            
                            <Link to="/forgot-password" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        {/* Nút Submit */}
                        <button 
                            type="submit" disabled={loading}
                            className={`w-full py-3.5 mt-2 text-base font-bold text-white transition-all rounded-full shadow-md flex justify-center items-center ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'}`}
                        >
                            {loading ? 'ĐANG XÁC THỰC...' : 'ĐĂNG NHẬP'}
                        </button>
                    </form>
                    {/* Switch to Register */}
                    <div className="mt-8 text-center border-t border-slate-100 pt-6">
                        <p className="text-sm text-slate-600">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                Tạo tài khoản
                            </Link>
                        </p>
                    </div>
                    {/* Popup Modal */}
                    <Modal 
                        isOpen={isSuccessModalOpen} 
                        title="Xác thực thành công"
                    >
                        <div className="flex flex-col items-center py-6">
                            {/* Thêm class animate-bounce để icon nảy lên nhìn vui mắt hơn */}
                            <FaCheckCircle className="text-6xl text-green-500 mb-4 animate-bounce" />
                            <p className="text-lg font-semibold text-slate-800 mb-1">
                                Chào mừng trở lại!
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang chuyển hướng đến Trang chủ...
                            </p>
                        </div>
                    </Modal>
                </div>
            </div>
            
        </div>
    );
};

export default Login;