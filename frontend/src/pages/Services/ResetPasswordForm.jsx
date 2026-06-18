import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../../utils/axiosClients';
import logo from '../../assets/logo.png'; 
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import Modal from '../../components/common/Modal';

const ResetPasswordForm = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Extract token and uid from URL: /reset_password?uid=...&token=...
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu nhập lại không khớp!');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }

        if (!uid || !token) {
            setError('Đường dẫn không hợp lệ hoặc đã hết hạn.');
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post('users/password-reset-confirm/', {
                uidb64: uid,
                token: token,
                password: password
            });
            
            setIsSuccessModalOpen(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error("Lỗi đặt lại mật khẩu:", err);
            // Default Django error for invalid token is a list or dict
            setError('Liên kết khôi phục không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.');
        } finally {
            setLoading(false);
        }
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
                <div className="flex-1 text-center lg:text-left pt-0 lg:pt-0">
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
                    
                    <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">
                        Tạo mật khẩu mới
                    </h3>
                    <p className="text-sm text-slate-500 text-center mb-8">
                        Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                    </p>

                    {error && (
                        <div className="p-3 mb-6 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleReset} className="space-y-5">
                        
                        {/* New Password */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaLock />
                            </div>
                            <input 
                                type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu mới"
                                className="w-full pl-11 pr-4 py-2 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                <FaLock />
                            </div>
                            <input 
                                type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới"
                                className="w-full pl-11 pr-4 py-2 text-slate-800 bg-slate-50 border rounded-full outline-none border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        {/* Nút Submit */}
                        <button 
                            type="submit" disabled={loading}
                            className={`w-full py-2 mt-4 text-base font-bold text-white transition-all rounded-full shadow-md flex justify-center items-center ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'}`}
                        >
                            {loading ? 'ĐANG CẬP NHẬT...' : 'XÁC NHẬN MẬT KHẨU MỚI'}
                        </button>
                    </form>

                    <div className="mt-5 text-center border-t border-slate-100 pt-5">
                        <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                            Quay lại đăng nhập
                        </Link>
                    </div>

                    {/* Popup Modal */}
                    <Modal 
                        isOpen={isSuccessModalOpen} 
                        title="Đổi mật khẩu thành công"
                        onClose={() => {}}
                    >
                        <div className="flex flex-col items-center py-6 text-center">
                            <FaCheckCircle className="text-6xl text-green-500 mb-4 animate-bounce" />
                            <p className="text-lg font-semibold text-slate-800 mb-2">
                                Mật khẩu đã được cập nhật!
                            </p>
                            <p className="text-sm text-slate-600 mb-4 px-4">
                                Bạn đã thay đổi mật khẩu thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới này.
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-2">
                                Đang tự động quay lại trang đăng nhập...
                            </p>
                        </div>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordForm;
