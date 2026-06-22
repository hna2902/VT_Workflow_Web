import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WorkflowRow = ({ workflow, onSave, onDelete, isPrivileged }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    
    // State sync
    const [localName, setLocalName] = useState(workflow.name);
    const [localDescription, setLocalDescription] = useState(workflow.description || '');
    const [localVideoFiles, setLocalVideoFiles] = useState([]);
    const [localImageFiles, setLocalImageFiles] = useState([]);
    const [localDocumentFiles, setLocalDocumentFiles] = useState([]);

    const [deletedFileIds, setDeletedFileIds] = useState([]);

    const oldImages = workflow.files?.filter(f => f.file_type === 'image') || [];
    const oldVideos = workflow.files?.filter(f => f.file_type === 'video') || [];
    const oldDocuments = workflow.files?.filter(f => f.file_type === 'document') || [];

    // Reset state
    const handleCancelClick = () => {
        setIsEditing(false);
        setLocalName(workflow.name);
        setLocalDescription(workflow.description || '');
        setLocalVideoFiles([]);
        setLocalImageFiles([]);
        setLocalDocumentFiles([]);
        setDeletedFileIds([]);
    };

    const handleSaveClick = () => {
        // Submit to parent
        onSave(workflow.id, { 
            name: localName, 
            description: localDescription,
            video_files: localVideoFiles,
            image_files: localImageFiles,
            document_files: localDocumentFiles,
            deleted_file_ids: deletedFileIds
        });
        setIsEditing(false);
    };

    const toggleDeleteOldFile = (fileId) => {
        if (deletedFileIds.includes(fileId)) {
            setDeletedFileIds(deletedFileIds.filter(id => id !== fileId));
        } else {
            setDeletedFileIds([...deletedFileIds, fileId]);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between p-5 mb-4 transition-all bg-white border border-l-4 border-slate-200 border-l-indigo-500 rounded-2xl shadow-sm hover:shadow-md gap-4">
            
            <div className="flex-1 w-full">
                {isEditing ? (
                    // Edit mode
                    <div className="flex flex-col gap-3 w-full sm:max-w-xl animate-in fade-in slide-in-from-top-1">
                        <div>
                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 ml-1">Workflow Name</label>
                            <input 
                                type="text" 
                                value={localName} 
                                onChange={(e) => setLocalName(e.target.value)}
                                className="w-full px-3 py-2 text-base font-bold text-slate-800 bg-slate-50 border rounded-xl outline-none border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all" 
                                autoFocus 
                                placeholder="Enter workflow name..."
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 ml-1">Description</label>
                            <textarea 
                                value={localDescription} 
                                onChange={(e) => setLocalDescription(e.target.value)}
                                className="w-full px-3 py-2 text-sm text-slate-600 bg-slate-50 border rounded-xl outline-none border-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white transition-all resize-none h-20" 
                                placeholder="Enter description (optional)..."
                            />
                        </div>

                        <div className="space-y-3 mt-2">
                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Update Files (Optional)</label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex flex-col border border-slate-200 rounded-xl p-3 bg-slate-50">
                                    <span className="text-xs font-bold text-slate-600 mb-2">Ảnh bìa / Hình ảnh</span>
                                    <div className="flex flex-col gap-2 mb-2">
                                        {oldImages.map(f => (
                                            <div key={f.id} className={`flex items-center justify-between px-2 py-1.5 rounded-lg border ${deletedFileIds.includes(f.id) ? 'bg-red-50 border-red-200' : 'bg-indigo-50 border-indigo-100'}`}>
                                                <a href={f.file} target="_blank" rel="noreferrer" className={`text-xs truncate max-w-[80px] hover:underline ${deletedFileIds.includes(f.id) ? 'text-red-400 line-through' : 'text-indigo-700'}`} title={f.file}>Xem ảnh</a>
                                                <button type="button" onClick={() => toggleDeleteOldFile(f.id)} className={`text-xs font-bold shrink-0 ml-2 ${deletedFileIds.includes(f.id) ? 'text-slate-500 hover:text-slate-700' : 'text-red-500 hover:text-red-700'}`}>
                                                    {deletedFileIds.includes(f.id) ? 'Hoàn tác' : 'Xóa'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <input 
                                        type="file" 
                                        multiple
                                        onChange={(e) => setLocalImageFiles(Array.from(e.target.files))}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-2 file:rounded-lg file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                        accept="image/*"
                                    />
                                    {localImageFiles.length > 0 && <span className="text-[10px] text-green-600 font-medium mt-1">Sẽ thêm {localImageFiles.length} ảnh</span>}
                                </div>
                                <div className="flex flex-col border border-slate-200 rounded-xl p-3 bg-slate-50">
                                    <span className="text-xs font-bold text-slate-600 mb-2">Video</span>
                                    <div className="flex flex-col gap-2 mb-2">
                                        {oldVideos.map(f => (
                                            <div key={f.id} className={`flex items-center justify-between px-2 py-1.5 rounded-lg border ${deletedFileIds.includes(f.id) ? 'bg-red-50 border-red-200' : 'bg-indigo-50 border-indigo-100'}`}>
                                                <a href={f.file} target="_blank" rel="noreferrer" className={`text-xs truncate max-w-[80px] hover:underline ${deletedFileIds.includes(f.id) ? 'text-red-400 line-through' : 'text-indigo-700'}`} title={f.file}>Xem video</a>
                                                <button type="button" onClick={() => toggleDeleteOldFile(f.id)} className={`text-xs font-bold shrink-0 ml-2 ${deletedFileIds.includes(f.id) ? 'text-slate-500 hover:text-slate-700' : 'text-red-500 hover:text-red-700'}`}>
                                                    {deletedFileIds.includes(f.id) ? 'Hoàn tác' : 'Xóa'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <input 
                                        type="file" 
                                        multiple
                                        onChange={(e) => setLocalVideoFiles(Array.from(e.target.files))}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-2 file:rounded-lg file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                        accept="video/*"
                                    />
                                    {localVideoFiles.length > 0 && <span className="text-[10px] text-green-600 font-medium mt-1">Sẽ thêm {localVideoFiles.length} video</span>}
                                </div>
                                <div className="flex flex-col border border-slate-200 rounded-xl p-3 bg-slate-50">
                                    <span className="text-xs font-bold text-slate-600 mb-2">Tài liệu</span>
                                    <div className="flex flex-col gap-2 mb-2">
                                        {oldDocuments.map(f => (
                                            <div key={f.id} className={`flex items-center justify-between px-2 py-1.5 rounded-lg border ${deletedFileIds.includes(f.id) ? 'bg-red-50 border-red-200' : 'bg-indigo-50 border-indigo-100'}`}>
                                                <a href={f.file} target="_blank" rel="noreferrer" className={`text-xs truncate max-w-[80px] hover:underline ${deletedFileIds.includes(f.id) ? 'text-red-400 line-through' : 'text-indigo-700'}`} title={f.file}>Xem TL</a>
                                                <button type="button" onClick={() => toggleDeleteOldFile(f.id)} className={`text-xs font-bold shrink-0 ml-2 ${deletedFileIds.includes(f.id) ? 'text-slate-500 hover:text-slate-700' : 'text-red-500 hover:text-red-700'}`}>
                                                    {deletedFileIds.includes(f.id) ? 'Hoàn tác' : 'Xóa'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <input 
                                        type="file" 
                                        multiple
                                        onChange={(e) => setLocalDocumentFiles(Array.from(e.target.files))}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-2 file:rounded-lg file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    />
                                    {localDocumentFiles.length > 0 && <span className="text-[10px] text-green-600 font-medium mt-1">Sẽ thêm {localDocumentFiles.length} tài liệu</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // View mode
                    <div className="py-1">
                        <h3 
                            onClick={() => navigate(`/workflows/${workflow.id}/processes`)} 
                            className="text-lg font-extrabold text-slate-800 hover:text-indigo-600 cursor-pointer transition-colors leading-tight"
                        >
                            {workflow.name}
                        </h3>
                        
                        {/* Render description */}
                        {workflow.description ? (
                            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{workflow.description}</p>
                        ) : (
                            <p className="text-xs text-slate-400 italic mt-2">No description provided.</p>
                        )}
                        
                        {/* Display files */}
                        {(oldImages.length > 0 || oldVideos.length > 0 || oldDocuments.length > 0) && (
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                                {oldImages.length > 0 && (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                                        🖼️ {oldImages.length} Ảnh đính kèm
                                    </span>
                                )}
                                {oldVideos.length > 0 && (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                                        🎬 {oldVideos.length} Video đính kèm
                                    </span>
                                )}
                                {oldDocuments.length > 0 && (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                                        📄 {oldDocuments.length} Tài liệu đính kèm
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Action buttons */}
            {isPrivileged && (
                <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-24 mt-2 sm:mt-0">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={handleSaveClick} 
                                className="flex-1 px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-sm transition-all active:scale-95"
                            >
                                Lưu
                            </button>
                            <button 
                                onClick={handleCancelClick} 
                                className="flex-1 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl shadow-sm transition-all active:scale-95"
                            >
                                Hủy
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => setIsEditing(true)} 
                                className="flex-1 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl shadow-sm transition-all active:scale-95"
                            >
                                Sửa
                            </button>
                            <button 
                                onClick={() => onDelete(workflow)} 
                                className="flex-1 px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl shadow-sm transition-all active:scale-95"
                            >
                                Xóa
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkflowRow;