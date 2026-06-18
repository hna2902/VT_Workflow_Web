import React from 'react';
import Modal from '../../components/common/Modal';

const ProcessDelete = ({ isOpen, processItem, onClose, onConfirm }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa bước thực hiện">
            <div className="py-2">
                <p className="text-slate-600 mb-6 text-base leading-relaxed">
                    Bạn có chắc chắn muốn xóa <b className="text-slate-800">Bước {processItem?.step}: "{processItem?.name}"</b> không? 
                    <span className="block mt-2 text-sm text-red-500 font-medium">* Lưu ý: Hành động này không thể hoàn tác. Toàn bộ hình ảnh hướng dẫn và dữ liệu bên trong bước này cũng sẽ bị xóa vĩnh viễn.</span>
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-100">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="w-full sm:flex-1 px-4 py-2.5 border-2 border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button 
                        type="button"
                        onClick={onConfirm}
                        className="w-full sm:flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-sm hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
                    >
                        Xóa bước này
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ProcessDelete;