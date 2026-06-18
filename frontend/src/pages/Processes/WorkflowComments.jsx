import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../utils/axiosClients';
import defaultAvatar from '../../assets/default-avatar.png';
import { FaPaperPlane, FaUserCircle, FaPaperclip, FaTimes, FaFile, FaVideo } from 'react-icons/fa';
import Modal from '../../components/common/Modal';

const WorkflowComments = ({ workflowId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editSelectedFiles, setEditSelectedFiles] = useState([]);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const currentUserUsername = localStorage.getItem('user_username') || sessionStorage.getItem('user_username');
    const currentUserRole = localStorage.getItem('user_role') || sessionStorage.getItem('user_role');

    const renderFileUrl = (fileUrl) => {
        if (!fileUrl) return null;
        if (fileUrl.startsWith('http')) return fileUrl; 
        let baseURL = axiosClient.defaults.baseURL || 'http://localhost:8000';
        baseURL = baseURL.replace(/\/api\/?$/, ''); 
        return `${baseURL}${fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl}`;
    };

    const isVideo = (url) => {
        if (!url) return false;
        const lowerUrl = url.toLowerCase();
        return lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.mov');
    };

    const isImage = (url) => {
        if (!url) return false;
        const lowerUrl = url.toLowerCase();
        return lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.gif') || lowerUrl.endsWith('.webp');
    };

    useEffect(() => {
        if (workflowId) {
            fetchComments();
        }
    }, [workflowId]);

    const fetchComments = async () => {
        try {
            const res = await axiosClient.get(`comments/comments/?workflow=${workflowId}`);
            setComments(res.data.reverse()); // Reverse to show oldest first if API returns newest first
            setLoading(false);
            scrollToBottom();
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() && selectedFiles.length === 0) return;

        const formData = new FormData();
        formData.append('workflow', workflowId);
        if (newComment.trim()) {
            formData.append('content', newComment);
        } else {
            formData.append('content', 'Đã gửi hình ảnh');
        }

        selectedFiles.forEach(file => {
            formData.append('images[]', file);
        });

        try {
            const res = await axiosClient.post('comments/comments/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setComments([...comments, res.data]);
            setNewComment('');
            setSelectedFiles([]);
            scrollToBottom();
        } catch (error) {
            console.error("Failed to post comment:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!commentId) return;
        try {
            await axiosClient.delete(`comments/comments/${commentId}/`);
            setComments(comments.filter(c => c.id !== commentId));
            setDeletingCommentId(null);
        } catch (error) {
            console.error("Failed to delete comment:", error);
            alert("Lỗi khi xóa bình luận!");
            setDeletingCommentId(null);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editContent.trim() && editSelectedFiles.length === 0) return;
        try {
            const formData = new FormData();
            formData.append('content', editContent || 'Đã gửi hình ảnh');
            editSelectedFiles.forEach(file => {
                formData.append('images[]', file);
            });
            const res = await axiosClient.patch(`comments/comments/${commentId}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setComments(comments.map(c => c.id === commentId ? res.data : c));
            setEditingCommentId(null);
            setEditContent('');
            setEditSelectedFiles([]);
        } catch (error) {
            console.error("Failed to edit comment:", error);
            alert("Lỗi khi sửa bình luận!");
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200">
            {/* HEADER */}
            <div className="px-4 py-4 border-b border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-800">Thảo luận</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Trao đổi nội bộ về quy trình này</p>
                </div>
                <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md">
                    {comments.length}
                </div>
            </div>

            {/* MESSAGE LIST */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-center text-slate-500 text-sm py-4">Đang tải bình luận...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-slate-500 text-sm py-10">Chưa có bình luận nào. Hãy là người đầu tiên!</div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <img 
                                src={comment.user_avatar ? renderFileUrl(comment.user_avatar) : defaultAvatar} 
                                alt="Avatar" 
                                className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 border border-slate-200" 
                            />
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                                        {comment.user_name || comment.user_username || comment.user_email || 'Người dùng'}
                                        {comment.user_role === 'Admin' && (
                                            <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider bg-red-100 text-red-600 rounded-md font-bold">Admin</span>
                                        )}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(comment.create_at).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <div className="bg-slate-100 px-3 py-2 rounded-2xl rounded-tl-sm text-slate-700 text-sm whitespace-pre-wrap relative group">
                                    {editingCommentId === comment.id ? (
                                        <div className="flex flex-col gap-2 min-w-[200px] mt-1 mb-1">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-blue-200 rounded-lg outline-none min-h-[60px] focus:ring-2 focus:ring-blue-100"
                                            />
                                            {/* Preview Selected Files for Edit */}
                                            {editSelectedFiles.length > 0 && (
                                                <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                                                    {editSelectedFiles.map((file, index) => {
                                                        const isVideoFile = file.type.startsWith('video/');
                                                        const isImageFile = file.type.startsWith('image/');
                                                        return (
                                                            <div key={index} className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-slate-200 group bg-slate-50 flex items-center justify-center">
                                                                {isImageFile ? (
                                                                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                                                ) : isVideoFile ? (
                                                                    <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <FaFile className="text-slate-400 text-lg" />
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setEditSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                                                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <FaTimes className="text-white text-xs" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <label className="cursor-pointer text-slate-400 hover:text-blue-600 p-1 rounded transition-colors inline-block" title="Đính kèm file">
                                                        <FaPaperclip size={14} />
                                                        <input 
                                                            type="file" 
                                                            multiple 
                                                            accept="*/*"
                                                            className="hidden" 
                                                            onChange={(e) => {
                                                                if (e.target.files && e.target.files.length > 0) {
                                                                    const filesArray = Array.from(e.target.files);
                                                                    setEditSelectedFiles(prev => [...prev, ...filesArray]);
                                                                    e.target.value = '';
                                                                }
                                                            }} 
                                                        />
                                                    </label>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingCommentId(null)} className="text-[11px] font-medium text-slate-500 hover:text-slate-700 bg-slate-200 px-2 py-1 rounded">Hủy</button>
                                                    <button onClick={() => handleEditComment(comment.id)} className="text-[11px] font-bold text-white hover:bg-blue-700 bg-blue-600 px-2 py-1 rounded">Lưu</button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {comment.content}
                                            
                                            {/* Action Menu: Delete/Edit */}
                                            {(comment.user_username === currentUserUsername || currentUserRole === 'Admin') && (
                                                <div className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg shadow-md border border-slate-200 z-10">
                                                    {comment.user_username === currentUserUsername && (
                                                        <button onClick={() => { setEditingCommentId(comment.id); setEditContent(comment.content); setEditSelectedFiles([]); }} className="text-[10px] font-bold text-slate-500 hover:text-blue-600 p-1" title="Sửa bình luận">Sửa</button>
                                                    )}
                                                    <button onClick={() => setDeletingCommentId(comment.id)} className="text-[10px] font-bold text-slate-500 hover:text-red-600 p-1" title="Xóa bình luận">Xóa</button>
                                                </div>
                                            )}
                                            
                                            {/* Hiển thị file đính kèm nếu có */}
                                            {comment.images && comment.images.length > 0 && (
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    {comment.images.map((img, idx) => {
                                                        const fileUrl = renderFileUrl(img.img_url);
                                                        const fileName = img.img_url ? img.img_url.split('/').pop() : 'Tài liệu';

                                                        if (isVideo(img.img_url)) {
                                                            return (
                                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-black">
                                                                    <video src={fileUrl} controls className="w-full h-full object-cover" />
                                                                </div>
                                                            );
                                                        } else if (isImage(img.img_url)) {
                                                            return (
                                                                <a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                                                                    <img src={fileUrl} alt="Comment" className="w-full h-full object-cover" />
                                                                </a>
                                                            );
                                                        } else {
                                                            return (
                                                                <a key={idx} href={fileUrl} download target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center p-2 transition-colors group">
                                                                    <FaFile className="text-slate-400 text-2xl mb-1 group-hover:text-blue-500" />
                                                                    <span className="text-[10px] text-slate-600 text-center line-clamp-2 break-all">{fileName}</span>
                                                                </a>
                                                            );
                                                        }
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                {/* Preview Selected Files */}
                {selectedFiles.length > 0 && (
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                        {selectedFiles.map((file, index) => {
                            const isVideoFile = file.type.startsWith('video/');
                            const isImageFile = file.type.startsWith('image/');
                            return (
                                <div key={index} className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-slate-200 group bg-slate-50 flex items-center justify-center">
                                    {isImageFile ? (
                                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                    ) : isVideoFile ? (
                                        <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                    ) : (
                                        <FaFile className="text-slate-400 text-lg" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FaTimes className="text-white text-xs" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 shrink-0 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                        <FaPaperclip size={18} />
                    </button>
                    <input 
                        type="file"
                        multiple
                        accept="*/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                const filesArray = Array.from(e.target.files);
                                setSelectedFiles(prev => [...prev, ...filesArray]);
                                e.target.value = '';
                            }
                        }}
                    />

                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Nhập bình luận..."
                        className="flex-1 max-h-32 min-h-[40px] h-[40px] resize-none px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() && selectedFiles.length === 0}
                        className="w-10 h-10 shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaPaperPlane size={14} className="-ml-1" />
                    </button>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal 
                isOpen={!!deletingCommentId} 
                onClose={() => setDeletingCommentId(null)}
                title="Xác nhận xóa"
            >
                <div className="py-2">
                    <p className="text-slate-600 mb-6">Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.</p>
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setDeletingCommentId(null)}
                            className="px-4 py-2 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={() => handleDeleteComment(deletingCommentId)}
                            className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                        >
                            Xóa bình luận
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WorkflowComments;
