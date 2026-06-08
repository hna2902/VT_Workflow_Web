import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

function App() {
  // Global state for active category
  const [activeCategory, setActiveCategory] = useState('Nguồn');

  return (
    <div className="flex flex-col h-screen font-sans text-gray-800 bg-gray-200">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        <MainContent activeCategory={activeCategory} />
      </div>
    </div>
  );
}

export default App;