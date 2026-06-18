import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WorkflowRow = ({ workflow, onSave, onDelete, isPrivileged }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    
    // REASON: Syncing local state with both 'name' and 'description' from the model
    const [localName, setLocalName] = useState(workflow.name);
    const [localDescription, setLocalDescription] = useState(workflow.description || '');
    const [localVideoFile, setLocalVideoFile] = useState(null);
    const [localImageFile, setLocalImageFile] = useState(null);
    const [localDocumentFile, setLocalDocumentFile] = useState(null);

    // REASON: Reset local state back to original values if user cancels editing
    const handleCancelClick = () => {
        setIsEditing(false);
        setLocalName(workflow.name);
        setLocalDescription(workflow.description || '');
        setLocalVideoFile(null);
        setLocalImageFile(null);
        setLocalDocumentFile(null);
    };

    const handleSaveClick = () => {
        // REASON: Send the updated name and description back to the parent (WorkflowView)
        onSave(workflow.id, { 
            name: localName, 
            description: localDescription,
            video_file: localVideoFile,
            image_file: localImageFile,
            document_file: localDocumentFile
        });
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between p-5 mb-4 transition-all bg-white border border-l-4 border-slate-200 border-l-indigo-500 rounded-2xl shadow-sm hover:shadow-md gap-4">
            
            <div className="flex-1 w-full">
                {isEditing ? (
                    // ================= EDIT MODE =================
                    <div className="flex flex-col gap-3 w-full sm:max-w-xl animate-in fade-in slide-in-from-top-1">
                        {/* Name Input */}
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

                        {/* Description Textarea */}
                        <div>
                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 ml-1">Description</label>
                            <textarea 
                                value={localDescription} 
                                onChange={(e) => setLocalDescription(e.target.value)}
                                className="w-full px-3 py-2 text-sm text-slate-600 bg-slate-50 border rounded-xl outline-none border-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white transition-all resize-none h-20" 
                                placeholder="Enter description (optional)..."
                            />
                        </div>

                        {/* File Inputs (Only visible during edit) */}
                        <div className="space-y-3 mt-2">
                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Update Files (Optional)</label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Image */}
                                <div className="flex flex-col border border-slate-200 rounded-xl p-3 bg-slate-50">
                                    <span className="text-xs font-bold text-slate-600 mb-1">Ảnh bìa</span>
                                    <input 
                                        type="file" 
                                        onChange={(e) => setLocalImageFile(e.target.files[0])}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-2 file:rounded-lg file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                        accept="image/*"
                                    />
                                </div>
                                {/* Video */}
                                <div className="flex flex-col border border-slate-200 rounded-xl p-3 bg-slate-50">
                                    <span className="text-xs font-bold text-slate-600 mb-1">Video</span>
                                    <input 
                                        type="file" 
                                        onChange={(e) => setLocalVideoFile(e.target.files[0])}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-2 file:rounded-lg file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                        accept="video/*"
                                    />
                                </div>
                                {/* Document */}
                                <div className="flex flex-col border border-slate-200 rounded-xl p-3 bg-slate-50">
                                    <span className="text-xs font-bold text-slate-600 mb-1">Tài liệu</span>
                                    <input 
                                        type="file" 
                                        onChange={(e) => setLocalDocumentFile(e.target.files[0])}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-2 file:rounded-lg file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // ================= VIEW MODE =================
                    <div className="py-1">
                        <h3 
                            onClick={() => navigate(`/workflows/${workflow.id}/processes`)} 
                            className="text-lg font-extrabold text-slate-800 hover:text-indigo-600 cursor-pointer transition-colors leading-tight"
                        >
                            {workflow.name}
                        </h3>
                        
                        {/* REASON: Render description only if it's not empty */}
                        {workflow.description ? (
                            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{workflow.description}</p>
                        ) : (
                            <p className="text-xs text-slate-400 italic mt-2">No description provided.</p>
                        )}
                    </div>
                )}
            </div>
            
            {/* ACTION BUTTONS */}
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