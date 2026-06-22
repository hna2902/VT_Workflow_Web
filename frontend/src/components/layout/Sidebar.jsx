import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import axiosClient from '../../utils/axiosClients';
import { getUserStorage, setUserStorage } from '../../utils/storage';

const Sidebar = () => {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    
    const currentUserRole = getUserStorage('user_role', 'User');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // API request
                const response = await axiosClient.get('processes/categories/');
                
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

    const visibleCategories = filteredCategories.filter(cat => {
        if (currentUserRole === 'Admin') return true; // Admin sees all
        return cat.status !== 'Inactive'; // User sees active only
    });

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Mobile toggle */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`md:hidden fixed top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-8 h-16 text-xl font-bold text-white bg-blue-600 shadow-[4px_0_10px_rgba(0,0,0,0.1)] hover:bg-blue-700 transition-all duration-300 rounded-r-xl ${isOpen ? 'left-72' : 'left-0'}`}
            >
                {isOpen ? '‹' : '›'}
            </button>

            {isOpen && (
                <div 
                    className="absolute inset-0 z-30 bg-black/50 md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside 
                className={`absolute md:relative z-40 flex flex-col w-72 h-full border-r bg-slate-50 border-slate-300 shrink-0 shadow-2xl md:shadow-inner transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                <div className="p-4 border-b border-slate-300 shrink-0 bg-slate-200">
                    <input 
                        type="text" 
                        placeholder="Tìm danh mục..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="px-4 py-6 text-sm text-center italic text-slate-500">
                            Đang tải danh mục...
                        </div>
                    ) : (
                        <ul className="py-2">
                            {visibleCategories.length > 0 ? (
                                visibleCategories.map((cat) => {
                                    // Determine route
                                    const destinationUrl = currentUserRole === 'Admin' 
                                        ? `/admin/categories/${cat.id}/assets` 
                                        : `/categories/${cat.id}/assets`;

                                    return (
                                        <li key={cat.id}>
                                            <NavLink
                                                to={destinationUrl} // Pass created variable
                                                onClick={handleLinkClick}
                                                className={({ isActive }) => 
                                                    `block px-6 py-3.5 transition-colors ${
                                                        isActive 
                                                            ? 'bg-blue-100 text-blue-800 border-r-4 border-blue-600 font-bold shadow-inner' 
                                                            : 'text-slate-600 hover:bg-slate-200 hover:text-blue-600 font-medium'
                                                    } ${cat.status === 'Inactive' ? 'opacity-70 italic' : ''}` 
                                                }
                                            >
                                                {/* Show hidden label */}
                                                {cat.title} {currentUserRole === 'Admin' && cat.status === 'Inactive' && (
                                                    <span className="text-red-500 text-xs ml-1 font-bold">(ẩn)</span>
                                                )}
                                            </NavLink>
                                        </li>
                                    );
                                })
                            ) : (
                                <li className="px-6 py-4 text-sm italic text-slate-500">
                                    Không tìm thấy danh mục
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                {currentUserRole === 'Admin' && (
                    <div className="p-4 border-t border-slate-300 bg-slate-200 shrink-0">
                        <Link 
                            to="/admin/categories/manage" // Manage URL
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