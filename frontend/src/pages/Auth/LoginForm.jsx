import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo.png'; // Đảm bảo bạn đã có logo ở đây
// Import vài icon cho nó giống với Flutter code của bạn
import { FaEnvelope, FaLock } from 'react-icons/fa'; 

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/token/', {
                username: username,
                password: password
            });

            localStorage.setItem('access_token', response.data.access);
            if (response.data.refresh) {
                localStorage.setItem('refresh_token', response.data.refresh);
            }

            navigate('/categories/manage');
            
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            setError('Tài khoản hoặc mật khẩu không chính xác!');
        } finally {
            setLoading(false);
        }
    };

    return (
        // ================= WRAPPER TỔNG: Chiếm toàn màn hình =================
        // Dùng bg-blue-900 làm màu nền chủ đạo thay cho ảnh nền (như Flutter code của bạn)
        <div className="flex min-h-screen bg-slate-800">
            
            {/* ================= CỘT TRÁI: Branding (Chỉ hiện trên màn hình lớn) ================= */}
            {/* Trên điện thoại (mặc định) sẽ bị ẩn (hidden). Từ màn hình lg trở lên mới hiện ra và chiếm 50% */}
            <div className="hidden lg:flex lg:flex-col justify-center w-1/2 p-16 bg-blue-900 text-white relative overflow-hidden">
                
                {/* Một chút hiệu ứng trang trí nền cho đẹp */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

                <div className="relative z-10 max-w-xl">
                    <div className="flex items-center gap-4 mb-8">
                        <img src={logo} alt="VT Logo" className="h-16 object-contain bg-white rounded p-1" />
                        <h1 className="text-5xl font-extrabold tracking-tight">
                            <span className="text-red-500">VT</span> Workflow
                        </h1>
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-6 leading-tight">
                        Lên kế hoạch cho hành trình <br/> công việc của bạn.
                    </h2>
                    <p className="text-lg text-blue-200 leading-relaxed">
                        Hệ thống quản lý quy trình nghiệp vụ nội bộ, giúp tối ưu hóa thời gian và tăng cường sự phối hợp giữa các phòng ban.
                    </p>
                </div>
            </div>

            {/* ================= CỘT PHẢI: Form Đăng Nhập ================= */}
            <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 sm:p-12 md:p-24 bg-slate-50">
                
                {/* Form Container (Có box-shadow giống Flutter) */}
                <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.1)] border border-slate-100">
                    
                    {/* Header Cột Phải (Dành cho Mobile khi cột trái bị ẩn) */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <img src={logo} alt="VT Logo" className="h-12 mb-4 object-contain" />
                        <h2 className="text-2xl font-bold text-slate-800">
                            <span className="text-red-600">VT</span> Workflow
                        </h2>
                    </div>

                    <h3 className="text-2xl font-bold text-center text-slate-800 mb-8">
                        Đăng nhập hệ thống
                    </h3>

                    {/* Hiển thị lỗi */}
                    {error && (
                        <div className="p-3 mb-6 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        
                        {/* 1. Ô nhập Username (Dùng Icon giống Flutter) */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaEnvelope />
                            </div>
                            <input 
                                type="text" 
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Tên đăng nhập"
                                // Padding Left to ra (pl-11) để né cái icon
                                className="w-full pl-11 pr-4 py-3.5 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        {/* 2. Ô nhập Password */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaLock />
                            </div>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mật khẩu"
                                className="w-full pl-11 pr-4 py-3.5 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        {/* Quên mật khẩu */}
                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        {/* Nút Đăng nhập (Bo tròn giống Flutter) */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-3.5 mt-2 text-base font-bold text-white transition-all rounded-full shadow-md flex justify-center items-center ${
                                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
                            }`}
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'ĐĂNG NHẬP'}
                        </button>
                    </form>

                </div>
            </div>
            
        </div>
    );
};

export default Login;