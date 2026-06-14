import React from 'react';
import Modal from '../../../components/common/Modal';

const CategoryDelete = ({ isOpen, category, onClose, onConfirm }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa">
            <div className="py-4">
                <p className="text-slate-600 mb-6">
                    Bạn có chắc chắn muốn xóa category <b>{category?.title}</b> không?
                </p>
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CategoryDelete;