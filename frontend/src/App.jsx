import React from 'react';
// Import routing components from react-router-dom
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import common layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Import specific pages
import Login from './pages/Auth/LoginForm';
import Register from './pages/Auth/RegisterForm';
import Home from './pages/Home/Home';
import CategoryIndex from './pages/Categories/CategoryIndex';
//import AssetIndex from './pages/Assets/AssetIndex';
//import WorkflowIndex from './pages/Workflows/WorkflowIndex';


const ProtectedLayout = () => {
  const isAuthenticated = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col h-screen font-sans text-slate-800 bg-slate-200">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        
        {/* Public Address */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />     
        {/* Navigated to Home after Login Success */}
        <Route path="/" element={<Navigate to="/home" replace />} />
    
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />       
        </Route>

      </Routes>
    </Router>
  );
}

export default App;