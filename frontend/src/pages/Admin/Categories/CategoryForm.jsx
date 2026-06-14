import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryForm = ({ onSuccess }) => {
    // 1. FORM STATE: Khớp hoàn toàn với Model Django
    const [formData, setFormData] = useState({
        title: '',
        leader: '', // Sẽ lưu ID của User
        status: 'Active'
    });

    const [users, setUsers] = useState([]); // Danh sách để chọn Leader

    // 2. FETCH USERS: Lấy danh sách nhân viên để đổ vào Select
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get('http://localhost:8000/api/users/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data);
            } catch (err) {
                console.error("Không lấy được danh sách nhân viên");
            }
        };
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. SUBMIT LOGIC: Hàm này sẽ được gọi từ nút "Lưu" ở Footer của Modal
    // Chúng ta sẽ "export" nó ra hoặc dùng một kỹ thuật để Modal gọi được nó.
    // Cách đơn giản nhất: Form tự xử lý nút submit bên trong nó.
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            await axios.post('http://localhost:8000/api/processes/categories/', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess(); // Gọi hàm tải lại danh sách và đóng modal
        } catch (err) {
            alert("Lỗi khi thêm danh mục: " + (err.response?.data?.title || "Kiểm tra lại dữ liệu"));
        }
    };

    return (
        <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Title Field */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên danh mục</label>
                <input 
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 border-slate-300"
                    placeholder="Ví dụ: Thiết bị mạng"
                />
            </div>

            {/* Leader Field (ForeignKey) */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Người quản lý (Leader)</label>
                <select 
                    name="leader"
                    value={formData.leader}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 border-slate-300 bg-white"
                >
                    <option value="">-- Chọn nhân viên --</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name || user.username}</option>
                    ))}
                </select>
            </div>

            {/* Status Field */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                <select 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 border-slate-300 bg-white"
                >
                    <option value="Active">Hoạt động (Active)</option>
                    <option value="Inactive">Ẩn (Inactive)</option>
                </select>
            </div>
            
            {/* Hidden submit button to allow Enter key to work */}
            <button type="submit" className="hidden">Submit</button>
        </form>
    );
};

export default CategoryForm;