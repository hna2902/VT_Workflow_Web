import React, { useState, useEffect } from 'react';
import axiosClient from '../../utils/axiosClients';
import UserHeader from '../../components/layout/UserHeader';
import { FaBell, FaTrash, FaCheck } from 'react-icons/fa';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            // Fetch notifications
            const res = await axiosClient.get('notifications/notifications/');
            setNotifications(res.data);
            // Mark all as read
            await axiosClient.patch('notifications/notifications/mark_all_read/');
            
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;
        try {
            await axiosClient.delete(`notifications/notifications/${id}/`);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error("Failed to delete notification:", error);
            alert("Lỗi khi xóa thông báo!");
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm("Bạn có chắc muốn xóa TẤT CẢ thông báo?")) return;
        try {
            await Promise.all(notifications.map(n => axiosClient.delete(`notifications/notifications/${n.id}/`)));
            setNotifications([]);
        } catch (error) {
            console.error("Failed to delete all notifications:", error);
            alert("Lỗi khi xóa thông báo!");
            fetchNotifications();
        }
    };

    return (
        <main className="flex flex-col flex-1 h-full bg-slate-50 overflow-hidden">
            <UserHeader 
                contextTitle="Trung tâm thông báo"
                contextLabel="Hệ thống"
                hideContextImage={true}
                hideSearch={true}
            />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                <div className="max-w-4xl mx-auto w-full">
                    
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <FaBell className="text-blue-600" />
                            Thông báo của bạn
                        </h2>
                        {notifications.length > 0 && (
                            <button 
                                onClick={handleDeleteAll}
                                className="px-4 py-2 text-sm font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                Xóa tất cả
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-slate-500 font-medium">Đang tải thông báo...</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
                            <FaBell className="text-4xl text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Bạn không có thông báo nào.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {notifications.map(notif => (
                                <div key={notif.id} className="group flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <FaBell className="text-blue-500 text-sm" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-slate-800 font-medium leading-snug">{notif.message}</p>
                                        <p className="text-xs text-slate-400 mt-1.5 font-medium flex items-center gap-1.5">
                                            {new Date(notif.create_at).toLocaleString('vi-VN')}
                                            {!notif.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-2"></span>}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(notif.id)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                                        title="Xóa thông báo"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default NotificationCenter;
