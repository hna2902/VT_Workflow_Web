import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo.png'; 
import { FaUser, FaLock, FaIdCard } from 'react-icons/fa'; 

const RegisterForm = () => {
    // 1. State initialization
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    // 2. Form submission handler
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation for passwords
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);

        try {
            // Post data to Django backend
            await axios.post('http://localhost:8000/api/register/', {
                username: username,
                name: name,
                password: password
            });

            // Redirect on success
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate('/login');
            
        } catch (err) {
            console.error("Register error:", err);
            // Handle backend validation errors
            if (err.response?.data?.username) {
                setError('Tên đăng nhập này đã tồn tại!');
            } else {
                setError('Có lỗi xảy ra, vui lòng thử lại!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        // 3. Main wrapper
        <div className="relative flex items-center justify-center min-h-screen py-10">
            
            {/* Background layer */}
            <div className="absolute inset-0 z-0 fixed">
                <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop" 
                    alt="Background" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Content layer */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl px-6 lg:px-12 gap-12">
                
                {/* Left branding column */}
                <div className="flex-1 text-center lg:text-left pt-10 lg:pt-0 hidden md:block">
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                        <img src={logo} alt="VT Logo" className="h-16 lg:h-20 object-contain drop-shadow-xl bg-white/10 p-2 rounded-xl backdrop-blur-sm" />
                        <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
                            <span className="text-red-500">VT</span> Workflow
                        </h1>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight text-white drop-shadow-md">
                        Gia nhập cùng đội ngũ <br className="hidden lg:block"/> kiến tạo tương lai.
                    </h2>
                    <p className="text-lg text-slate-200 leading-relaxed max-w-lg mx-auto lg:mx-0 drop-shadow">
                        Đăng ký tài khoản để truy cập hệ thống quản lý quy trình, tham gia vào các dự án và theo dõi tiến độ công việc một cách chuyên nghiệp nhất.
                    </p>
                </div>

                {/* Right form card */}
                <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.3)] my-auto">
                    
                    <div className="md:hidden flex flex-col items-center mb-6">
                        <img src={logo} alt="VT Logo" className="h-12 mb-3 object-contain" />
                        <h2 className="text-xl font-bold text-slate-800"><span className="text-red-600">VT</span> Workflow</h2>
                    </div>

                    <h3 className="text-2xl font-bold text-center text-slate-800 mb-6">
                        Đăng ký tài khoản
                    </h3>

                    {/* Error display */}
                    {error && (
                        <div className="p-3 mb-6 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        
                        {/* Name Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaIdCard />
                            </div>
                            <input 
                                type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ và Tên"
                                className="w-full pl-11 pr-4 py-3.5 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        {/* Username Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaUser />
                            </div>
                            <input 
                                type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập"
                                className="w-full pl-11 pr-4 py-3.5 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaLock />
                            </div>
                            <input 
                                type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu"
                                className="w-full pl-11 pr-4 py-3.5 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        {/* Confirm Password Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaLock />
                            </div>
                            <input 
                                type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu"
                                className="w-full pl-11 pr-4 py-3.5 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" disabled={loading}
                            className={`w-full py-3.5 mt-4 text-base font-bold text-white transition-all rounded-full shadow-md flex justify-center items-center ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'}`}
                        >
                            {loading ? 'ĐANG XỬ LÝ...' : 'TẠO TÀI KHOẢN'}
                        </button>
                    </form>

                    {/* Switch to Login link */}
                    <div className="mt-6 text-center border-t border-slate-100 pt-6">
                        <p className="text-sm text-slate-600">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
            
        </div>
    );
};

export default RegisterForm;