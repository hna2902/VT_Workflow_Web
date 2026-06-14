import React, { useState } from 'react';

const ChangePasswordForm = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
                <input 
                    type="password" name="currentPassword" required
                    value={formData.currentPassword} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
                />
            </div>
            
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu mới</label>
                <input 
                    type="password" name="newPassword" required
                    value={formData.newPassword} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nhập lại mật khẩu mới</label>
                <input 
                    type="password" name="confirmPassword" required
                    value={formData.confirmPassword} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
                />
            </div>
            
            <div className="flex gap-3 pt-4">
                <button 
                    type="button" 
                    onClick={onClose}
                    // THÊM: cursor-pointer, đổi hover sang slate-100 và chữ đậm hơn
                    className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-200 hover:text-slate-800 hover:border-slate-500 transition-all cursor-pointer"
                >
                    Hủy
                </button>
                <button 
                    type="submit"
                    // THÊM: cursor-pointer và hiệu ứng bóng lưng khi hover
                    className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all cursor-pointer"
                >
                    Lưu thay đổi
                </button>
            </div>
        </form>
    );
};

export default ChangePasswordForm;