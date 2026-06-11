import React from 'react';
// Import routing components from react-router-dom
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import common layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Import specific pages
import CategoryIndex from './pages/Categories/CategoryIndex';
//import AssetIndex from './pages/Assets/AssetIndex';
//import WorkflowIndex from './pages/Workflows/WorkflowIndex';

function App() {
  return (
    // Router must wrap the entire application to enable URL tracking
    <Router>
      <div className="flex flex-col h-screen font-sans text-slate-800 bg-slate-200">
        
        {/* Header stays static at the top */}
        <Header />
        
        <div className="flex flex-1 overflow-hidden relative">
          
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto bg-slate-50">
            {/* Routes acts as a switchboard. It looks at the URL and renders the matching component */}
            <Routes>
              
              {/* Default route: redirect users to /categories if they just type localhost:5173 */}
              <Route path="/" element={<Navigate to="/categories" replace />} />
              
              {/* Route for Category Management */}
              <Route path="/categories/index" element={<CategoryIndex />} />
              
              {/* Future routes (uncomment when files are created) */}
              {/* <Route path="/assets" element={<AssetIndex />} /> */}
              {/* <Route path="/workflows" element={<WorkflowIndex />} /> */}
              
            </Routes>
          </main>
          
        </div>
      </div>
    </Router>
  );
}

export default App;