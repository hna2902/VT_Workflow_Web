import React, { useState } from 'react';
import Modal from '../common/Modal';

const Sidebar = ({ activeCategory, setActiveCategory }) => {
  const [categories, setCategories] = useState(['Nguồn', 'Modem']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State to handle the input field inside the modal
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSaveCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, newCategoryName]);
      setNewCategoryName(''); // Reset input
      setIsModalOpen(false);  // Close modal
    }
  };

  return (
    <aside className="flex flex-col w-48 border-r bg-slate-100 border-slate-300 shrink-0 shadow-inner">
      <ul className="flex-1 py-4 overflow-y-auto">
        {categories.map((cat) => (
          <li 
            key={cat}
            className={`px-4 py-3 cursor-pointer transition-colors ${
              activeCategory === cat 
                ? 'bg-blue-200 text-blue-700 border-r-4 border-blue-600 font-bold' 
                : 'text-slate-600 hover:bg-slate-200 hover:text-blue-600 font-medium'
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </li>
        ))}
      </ul>
      
      {/* Trigger button */}
      <div className="p-4 border-t border-slate-300">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center w-full h-10 text-2xl text-white transition-colors bg-blue-600 rounded shadow-sm hover:bg-blue-700"
        >
          +
        </button>
      </div>

      {/* Reusable Modal implementation for Category */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Thêm Danh Mục Mới"
      >
        {/* Content injected as 'children' */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-slate-600"> Tên danh mục </label>
          <input 
            type="text" 
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Ví dụ: Hệ thống camera..."
            className="w-full px-4 py-2 bg-white border rounded-md outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            autoFocus
          />
        </div>

        {/* Action buttons injected as 'children' */}
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 font-medium transition-colors rounded-md text-slate-600 bg-slate-100 hover:bg-slate-200"
          >
            Hủy
          </button>
          <button 
            onClick={handleSaveCategory}
            className="px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Lưu
          </button>
        </div>
      </Modal>

    </aside>
  );
};

export default Sidebar;