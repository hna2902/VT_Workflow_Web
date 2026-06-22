import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo.png'; 
import { FaUser, FaLock, FaIdCard, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import Modal from '../../components/common/Modal';

const RegisterForm = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);

        try {
            // Send API request
            await axios.post('/api/users/register/', {
                username: username,
                name: name,
                password: password
            });

            // Redirect on success
            setIsSuccessModalOpen(true);
            
        } catch (err) {
            console.error("Register error:", err);
            // Handle API errors
            if (err.response?.data?.username) {
                setError('Tên đăng nhập này đã tồn tại!');
            } else {
                setError('Có lỗi xảy ra, vui lòng thử lại!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setIsSuccessModalOpen(false);
        navigate('/login');
    };

    return (
        <div className="relative flex items-center justify-center min-h-[100dvh] overflow-y-auto py-6">
            
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop" 
                    alt="Background" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full max-w-7xl px-4 sm:px-6 lg:px-12 gap-8 lg:gap-12">
                
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left w-full mb-8 lg:mb-0 pt-8 lg:pt-0">
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 mb-8">
                        <img src={logo} alt="VT Logo" className="h-20 sm:h-24 lg:h-28 object-contain drop-shadow-xl bg-white/10 p-3 rounded-2xl backdrop-blur-md shrink-0" />
                        <div className="flex flex-col items-center sm:items-start">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg leading-tight">
                                <span className="text-red-500">VT</span> Workflow
                            </h1>
                            <span className="text-white text-lg sm:text-xl lg:text-2xl font-bold tracking-wide mt-1 uppercase opacity-90 drop-shadow-md">
                                Quản lý quy trình làm việc
                            </span>
                        </div>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6 leading-snug text-white drop-shadow-md max-w-2xl mx-auto lg:mx-0">
                        “Ươm mầm uy tín -<br className="hidden sm:block lg:hidden" /> Chăm sóc chất lượng -<br className="hidden sm:block lg:hidden" /> Gặt hái niềm tin”
                    </h2>
                </div>

                <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.3)]">

                    <h3 className="text-2xl font-bold text-center text-slate-800 mb-6">
                        Đăng ký tài khoản
                    </h3>

                    {error && (
                        <div className="p-3 mb-6 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="flex flex-col gap-3">
                        
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaIdCard />
                            </div>
                            <input 
                                type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ và Tên"
                                className="w-full pl-11 pr-4 py-2 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaUser />
                            </div>
                            <input 
                                type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập"
                                className="w-full pl-11 pr-4 py-2 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaLock />
                            </div>
                            <input 
                                type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu"
                                className="w-full pl-11 pr-4 py-2 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaLock />
                            </div>
                            <input 
                                type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu"
                                className="w-full pl-11 pr-4 py-2 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        <button 
                            type="submit" disabled={loading}
                            className={`w-full py-2 mt-4 text-base font-bold text-white transition-all rounded-full shadow-md flex justify-center items-center ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'}`}
                        >
                            {loading ? 'ĐANG XỬ LÝ...' : 'TẠO TÀI KHOẢN'}
                        </button>
                    </form>

                    <div className="mt-2 text-center border-t border-slate-100 pt-6">
                        <p className="text-sm text-slate-600">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                    <Modal 
                        isOpen={isSuccessModalOpen} 
                        onClose={handleModalClose} 
                        title="Đăng ký thành công"
                    >
                        <div className="flex flex-col items-center py-4">
                            <FaCheckCircle className="text-6xl text-green-500 mb-4" />
                            <p className="text-center text-slate-600 mb-6">
                                Tài khoản của bạn đã được khởi tạo trên hệ thống. <br/>
                                Vui lòng đăng nhập để bắt đầu sử dụng.
                            </p>
                            
                            <button 
                                onClick={handleModalClose}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Đến trang Đăng nhập
                            </button>
                        </div>
                    </Modal>
                </div>
            </div>
            
        </div>
    );
};

export default RegisterForm;