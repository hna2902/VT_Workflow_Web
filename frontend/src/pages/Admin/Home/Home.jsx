import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaFolderOpen } from 'react-icons/fa';
import homeBgImage from '../../../assets/home_background.jpg';

const Home = () => {
    const name = localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || 'Admin';

    return (
        <div className="relative w-full h-full min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-slate-900">
            
            <img 
                src={homeBgImage} 
                alt="Background" 
                className="absolute inset-0 w-full h-full object-cover z-0" 
            />

            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-10"></div>

            <div className="relative z-20 w-full p-6 lg:p-8 flex flex-col items-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight text-center mb-10 drop-shadow-lg">
                    Chào mừng quay lại, <span className="text-blue-400">{name}</span>!
                </h1>

                <div className="w-full max-w-3xl bg-white p-8 rounded-[24px] shadow-2xl border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-700 mb-6 text-center uppercase tracking-wider">
                        Bảng điều khiển quản trị
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link to="/users/manage" className="flex-1 w-full p-6 flex flex-col items-center justify-center gap-4 bg-blue-50/70 rounded-2xl border border-blue-100 hover:bg-blue-100 hover:shadow-md transition-all group">
                            <div className="p-4 bg-blue-600 text-white rounded-full group-hover:scale-110 transition-transform">
                                <FaUsers className="text-2xl" />
                            </div>
                            <span className="font-bold text-blue-900">Quản lý người dùng</span>
                        </Link>

                        <Link to="/categories/manage" className="flex-1 w-full p-6 flex flex-col items-center justify-center gap-4 bg-amber-50/70 rounded-2xl border border-amber-100 hover:bg-amber-100 hover:shadow-md transition-all group">
                            <div className="p-4 bg-amber-500 text-white rounded-full group-hover:scale-110 transition-transform">
                                <FaFolderOpen className="text-2xl" />
                            </div>
                            <span className="font-bold text-amber-900">Quản lý danh mục</span>
                        </Link>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default Home;