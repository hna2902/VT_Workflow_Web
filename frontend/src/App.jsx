import React from 'react';
// Import routing components from react-router-dom
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import common layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Import specific pages (Services/Shared)
import Login from './pages/Services/LoginForm';
import Register from './pages/Services/RegisterForm';
import Information from './pages/Services/Information';
import ChangePasswordForm from './pages/Services/ChangePasswordForm';

// Admin Pages
// REASON: Import AdminHome with its explicit name to prevent collision with UserHome
import AdminHome from './pages/Admin/Home/AdminHome';
import CategoryIndex from './pages/Admin/Categories/CategoryIndex';
import UsersIndex from './pages/Admin/Users/UsersIndex';

// User Pages
import UserHome from './pages/User/Home/UserHome';

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

// Keep a single "/home" route for cleaner URLs. This component acts as a traffic 
const RoleBasedHome = () => {
  const role = localStorage.getItem('user_role') || sessionStorage.getItem('user_role');
  
  if (role === 'Admin') {
    return <AdminHome />;
  }
  return <UserHome />;
};

// Dedicated wrapper to protect Admin-only routes (Index, Form, Delete)
const AdminRoute = () => {
  const role = localStorage.getItem('user_role') || sessionStorage.getItem('user_role');
  
  if (role !== 'Admin') {
    return <Navigate to="/home" replace />;
  }
  return <Outlet />;
};


function App() {
  return (
    <Router>
      <Routes>
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />    
        <Route path="/" element={<Navigate to="/home" replace />} />
    
        {/* Protected Routes (Requires Login) */}
        <Route element={<ProtectedLayout />}>
          
          {/* Traffic Controller for Home */}
          <Route path="/home" element={<RoleBasedHome />} /> 
          
          {/* Shared Services (Both Admin and User can access) */}
          <Route path="/information" element={<Information />} />    

          {/* ADMIN ZONE */}
          <Route element={<AdminRoute />}>
            <Route path="/categories/manage" element={<CategoryIndex />} />
            <Route path="/users/manage" element={<UsersIndex />} />
            {/* Future Admin routes (AssetIndex, WorkflowIndex) go here */}
          </Route>
          {/* USER ZONE */}

        </Route>

      </Routes>
    </Router>
  );
}

export default App;