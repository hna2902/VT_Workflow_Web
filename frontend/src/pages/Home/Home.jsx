import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaFolderOpen } from 'react-icons/fa';
import homeBgImage from '../../assets/home_background.jpg';

const AdminDashboard = ({ userName }) => (
    <div className="p-6 lg:p-8 flex flex-col items-center">
        {/* SỬA: Đổi text thành màu trắng, đổi màu nhấn thành xanh dương sáng (blue-400) để nổi trên nền tối */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight text-center mb-10 drop-shadow-lg">
            Chào mừng quay lại, <span className="text-blue-400">{userName}</span>!
        </h1>

        {/* Khung Quick Actions: Giữ nền trắng để tạo độ tương phản mạnh mẽ với background tối */}
        <div className="w-full max-w-3xl bg-white p-8 rounded-[24px] shadow-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-700 mb-6 text-center uppercase tracking-wider">
                Bảng điều khiển quản trị
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {/* User Management Card */}
                <Link to="/users/manage" className="flex-1 w-full p-6 flex flex-col items-center justify-center gap-4 bg-blue-50/70 rounded-2xl border border-blue-100 hover:bg-blue-100 hover:shadow-md transition-all group">
                    <div className="p-4 bg-blue-600 text-white rounded-full group-hover:scale-110 transition-transform">
                        <FaUsers className="text-2xl" />
                    </div>
                    <span className="font-bold text-blue-900">Quản lý người dùng</span>
                </Link>

                {/* Category Management Card */}
                <Link to="/categories/manage" className="flex-1 w-full p-6 flex flex-col items-center justify-center gap-4 bg-amber-50/70 rounded-2xl border border-amber-100 hover:bg-amber-100 hover:shadow-md transition-all group">
                    <div className="p-4 bg-amber-500 text-white rounded-full group-hover:scale-110 transition-transform">
                        <FaFolderOpen className="text-2xl" />
                    </div>
                    <span className="font-bold text-amber-900">Quản lý danh mục</span>
                </Link>
            </div>
        </div>
    </div>
);

const UserDashboard = ({ userName }) => (
    <div className="p-6 lg:p-8 flex flex-col items-center justify-center text-center">
        {/* SỬA: Đổi text thành màu trắng và blue-400 */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
            Chào mừng quay lại, <span className="text-blue-400">{userName}</span>!
        </h1>
        {/* SỬA: Đổi nền của câu chúc thành màu đen mờ (black/30) và viền sáng nhẹ để hợp tông tối */}
        <p className="text-slate-200 mt-5 font-medium text-lg drop-shadow-sm bg-black/30 px-5 py-2.5 rounded-full border border-white/10">
            Chúc bạn một ngày làm việc hiệu quả
        </p>
    </div>
);

const Home = () => {
    // Đoạn này lấy chuẩn xác trường "name" mà Backend trả về
    const role = localStorage.getItem('user_role') || sessionStorage.getItem('user_role') || 'User'; 
    const name = localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || 'Bạn';

    const DashboardView = role === 'Admin'
        ? <AdminDashboard userName={name} />
        : <UserDashboard userName={name} />;

    return (
        <div className="relative w-full h-full min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-slate-900">
            
            <img 
                src={homeBgImage} 
                alt="Background" 
                className="absolute inset-0 w-full h-full object-cover z-0" 
            />

            {/* SỬA: Đổi overlay sang hệ màu đen (slate-900) với độ phủ 40% (hoặc 50%) để làm nổi bật text trắng */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-10"></div>

            <div className="relative z-20 w-full">
                {DashboardView}
            </div>
        </div>
    );
};

export default Home;