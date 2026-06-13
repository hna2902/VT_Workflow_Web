import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import axios from 'axios';

const Sidebar = () => {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    
    const currentUserRole = localStorage.getItem('user_role') || sessionStorage.getItem('user_role') || 'User'; 

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Ensure we check both storages for the token
                const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
                
                const response = await axios.get('http://localhost:8000/api/processes/categories/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setCategories(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching categories from DB:", error);
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const filteredCategories = categories.filter(cat => 
        cat.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 text-2xl text-white bg-blue-600 rounded-full shadow-xl hover:bg-blue-700 transition-transform active:scale-95"
            >
                {isOpen ? '✕' : '☰'}
            </button>

            {isOpen && (
                <div 
                    className="absolute inset-0 z-30 bg-black/40 md:hidden transition-opacity backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside 
                className={`absolute md:relative z-40 flex flex-col w-72 h-full border-r bg-slate-50 border-slate-300 shrink-0 shadow-2xl md:shadow-inner transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                
                {/* HEADER SỬA MÀU: Đổi thành bg-slate-200 để làm xám hơn một chút */}
                <div className="p-4 border-b border-slate-300 shrink-0 bg-slate-200">
                    <input 
                        type="text" 
                        placeholder="Tìm danh mục..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* THÂN SIDEBAR (Danh sách) */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="px-4 py-6 text-sm text-center italic text-slate-500">
                            Đang tải danh mục...
                        </div>
                    ) : (
                        <ul className="py-2">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((cat) => (
                                    <li key={cat.id}>
                                        <NavLink
                                            to={`/categories/${cat.id}/assets`}
                                            onClick={handleLinkClick}
                                            className={({ isActive }) => 
                                                `block px-6 py-3.5 transition-colors ${
                                                    isActive 
                                                        ? 'bg-blue-100 text-blue-800 border-r-4 border-blue-600 font-bold shadow-inner' 
                                                        : 'text-slate-600 hover:bg-slate-200 hover:text-blue-600 font-medium'
                                                }`
                                            }
                                        >
                                            {cat.title}
                                        </NavLink>
                                    </li>
                                ))
                            ) : (
                                <li className="px-6 py-4 text-sm italic text-slate-500">
                                    Không tìm thấy danh mục
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                {/* FOOTER */}
                {currentUserRole === 'Admin' && (
                    <div className="p-4 border-t border-slate-300 bg-slate-200 shrink-0">
                        <Link 
                            to="/categories/index"
                            onClick={handleLinkClick}
                            className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white transition-colors bg-slate-700 rounded-lg shadow-sm hover:bg-slate-800 active:bg-slate-900"
                        >
                          Quản lý danh mục
                        </Link>
                    </div>
                )}
                
            </aside>
        </>
    );
};

export default Sidebar;