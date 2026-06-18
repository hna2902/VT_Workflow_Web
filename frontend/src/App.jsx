import React from 'react';
// Import routing components from react-router-dom
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import common layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Import specific pages (Services/Shared)
import Login from './pages/Services/LoginForm';
import Register from './pages/Services/RegisterForm';
import ForgotPasswordForm from './pages/Services/ForgotPasswordForm';
import ResetPasswordForm from './pages/Services/ResetPasswordForm';
import Information from './pages/Services/Information';
import WorkflowView from './pages/Workflows/WorkflowView';
import ProcessListView from './pages/Processes/ProcessListView';
import NotificationCenter from './pages/Notifications/NotificationCenter';

// Admin Pages
// REASON: Import AdminHome with its explicit name to prevent collision with UserHome
import AdminHome from './pages/Admin/Home/AdminHome';
import CategoryIndex from './pages/Admin/Categories/CategoryIndex';
import UsersIndex from './pages/Admin/Users/UsersIndex';
import AssetItemIndex from './pages/Admin/AssetItems/AssetItemIndex';

// User Pages
import UserHome from './pages/User/Home/UserHome';
import AssetItemView from './pages/User/AssetItems/AssetItemView';

const ProtectedLayout = () => {
    // REASON: Custom storage utility handles this better, but native storage is fine here too.
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

// Keep a single "/home" route for cleaner URLs. This component acts as a traffic controller
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
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/reset_password" element={<ResetPasswordForm />} />
                <Route path="/" element={<Navigate to="/home" replace />} />
        
                {/* Protected Routes (Requires Login) */}
                <Route element={<ProtectedLayout />}>
                    
                    {/* Traffic Controller for Home */}
                    <Route path="/home" element={<RoleBasedHome />} /> 
                    
                    {/* Shared Services (Both Admin and User can access) */}
                    <Route path="/information" element={<Information />} />    
                    <Route path="/notifications" element={<NotificationCenter />} />

                    {/* ================= ADMIN ZONE ================= */}
                    {/* REASON: Added '/admin/' prefix to these paths to match the conditional routing in Sidebar.jsx. 
                        This ensures clear separation between Admin views (List) and User views (Grid). */}
                    <Route element={<AdminRoute />}>
                        <Route path="/admin/categories/manage" element={<CategoryIndex />} />
                        <Route path="/admin/users/manage" element={<UsersIndex />} />
                        
                        {/* Admin sees the vertical List component */}
                        <Route path="/admin/categories/:categoryId/assets" element={<AssetItemIndex />} />
                        <Route path="/admin/assets/:itemId/workflows" element={<WorkflowView />} />
                    </Route>

                    {/* ================= USER ZONE ================= */}
                    {/* REASON: Placed outside of AdminRoute so Users and Leaders can access it.
                        When a User/Leader clicks a category in the Sidebar, they land here. */}
                    <Route path="/categories/:categoryId/assets" element={<AssetItemView />} />
                    <Route path="/assets/:itemId/workflows" element={<WorkflowView />} />
                    <Route path="/assets/:itemId/workflows" element={<div>Trang Workflow</div>} />
                    <Route path="/workflows/:workflowId/processes" element={<ProcessListView />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;