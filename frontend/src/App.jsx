import React from 'react';
// Routing components
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Specific pages
import Login from './pages/Services/LoginForm';
import Register from './pages/Services/RegisterForm';
import ForgotPasswordForm from './pages/Services/ForgotPasswordForm';
import ResetPasswordForm from './pages/Services/ResetPasswordForm';
import Information from './pages/Services/Information';
import WorkflowView from './pages/Workflows/WorkflowView';
import ProcessListView from './pages/Processes/ProcessListView';
import NotificationCenter from './pages/Notifications/NotificationCenter';

// Admin pages
// Explicit import to prevent collision
import AdminHome from './pages/Admin/Home/AdminHome';
import CategoryIndex from './pages/Admin/Categories/CategoryIndex';
import UsersIndex from './pages/Admin/Users/UsersIndex';
import AssetItemIndex from './pages/Admin/AssetItems/AssetItemIndex';

// User pages
import UserHome from './pages/User/Home/UserHome';
import AssetItemView from './pages/User/AssetItems/AssetItemView';

const ProtectedLayout = () => {
    // Auth token check
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

// Traffic controller for home route
const RoleBasedHome = () => {
    const role = localStorage.getItem('user_role') || sessionStorage.getItem('user_role');
    
    if (role === 'Admin') {
        return <AdminHome />;
    }
    return <UserHome />;
};

// Admin routes wrapper
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
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />    
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/reset_password" element={<ResetPasswordForm />} />
                <Route path="/" element={<Navigate to="/home" replace />} />
        
                {/* Protected routes */}
                <Route element={<ProtectedLayout />}>
                    
                    {/* Traffic controller */}
                    <Route path="/home" element={<RoleBasedHome />} /> 
                    
                    {/* Shared services */}
                    <Route path="/information" element={<Information />} />    
                    <Route path="/notifications" element={<NotificationCenter />} />

                    {/* Admin zone */}
                    {/* Route separation */}
                    <Route element={<AdminRoute />}>
                        <Route path="/admin/categories/manage" element={<CategoryIndex />} />
                        <Route path="/admin/users/manage" element={<UsersIndex />} />
                        
                        {/* List view */}
                        <Route path="/admin/categories/:categoryId/assets" element={<AssetItemIndex />} />
                        <Route path="/admin/assets/:itemId/workflows" element={<WorkflowView />} />
                    </Route>

                    {/* User zone */}
                    {/* Accessible to all users */}
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