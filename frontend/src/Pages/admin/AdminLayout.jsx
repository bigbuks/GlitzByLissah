import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { notify } from '../../utils/notify';   // ✅ correct
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // ✅ Use adminToken (separate from customer token)
    const token = localStorage.getItem('adminToken');

    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      // ✅ Decode the JWT token payload
      const payload = JSON.parse(atob(token.split('.')[1]));

      if (!payload.isAdmin) {
        notify.error('Access denied. Admin only.');
        navigate('/admin/login');
        return;
      }

      // ✅ Set user from token payload
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(payload);
    } catch (error) {
      console.error('Invalid token:', error);
      notify.error('Invalid session. Please login again.');
      // ✅ Clear admin keys only (don't affect customer session)
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // ✅ Clear admin keys only
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // Silent — the redirect to login is the feedback
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

            {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full z-50 lg:hidden shadow-2xl">
            <AdminSidebar />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition"
            >
              {isMobileSidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
            <div>
              <h1 className="font-serif text-lg lg:text-xl text-gray-800">
                Admin Panel
              </h1>
              {user && (
                <p className="text-xs text-gray-400">
                  Signed in as {user.email || user.id}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition"
          >
            <FiLogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;