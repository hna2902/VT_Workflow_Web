import React from 'react';
import homeBgImage from '../../../assets/home_background.jpg';

const UserHome = () => {
    const name = localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || 'Bạn';

    return (
        <div className="relative w-full h-full min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-slate-900">
            
            <img 
                src={homeBgImage} 
                alt="Background" 
                className="absolute inset-0 w-full h-full object-cover z-0" 
            />

            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-10"></div>

            <div className="relative z-20 w-full p-6 lg:p-8 flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
                    Chào mừng quay lại, <span className="text-blue-400">{name}</span>!
                </h1>
                <p className="text-slate-200 mt-5 font-medium text-lg drop-shadow-sm bg-black/30 px-5 py-2.5 rounded-full border border-white/10">
                    Chúc bạn một ngày làm việc hiệu quả
                </p>
            </div>
            
        </div>
    );
};

export default UserHome;