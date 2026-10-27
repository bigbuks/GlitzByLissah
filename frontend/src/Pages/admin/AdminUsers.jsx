import React, { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiCalendar } from 'react-icons/fi';
import { notify } from '../../utils/notify';   // ✅ correct
import api from '../../utils/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        if (response.data.success) {
          setUsers(response.data.users || []);
        }
      } catch (error) {
        console.error('❌ Error:', error);
        notify.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-serif text-2xl lg:text-3xl">Users</h1>
        <p className="text-sm text-gray-500">
          {users.length} total {users.length === 1 ? 'user' : 'users'}
        </p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <FiUsers className="mx-auto mb-3 text-gray-400" size={32} />
          No users yet
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-cream border-b border-gray-100 text-sm font-medium text-gray-600">
            <div className="col-span-4">User</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Joined</div>
          </div>

          {/* Users */}
          <div className="divide-y divide-gray-100">
            {users.map((user) => (
              <div
                key={user._id}
                className="p-4 lg:px-6 lg:py-4 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-center hover:bg-cream transition"
              >
                <div className="lg:col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-semibold">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {user.name || 'No name'}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-4 flex items-center gap-2 text-sm text-gray-600">
                  <FiMail size={14} className="text-gray-400" />
                  {user.email}
                </div>

                <div className="lg:col-span-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      user.isAdmin
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.isAdmin ? 'Admin' : 'Customer'}
                  </span>
                </div>

                <div className="lg:col-span-2 flex items-center gap-2 text-sm text-gray-500">
                  <FiCalendar size={14} className="text-gray-400" />
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;