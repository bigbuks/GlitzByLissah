import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiDollarSign,
  FiChevronRight,
} from 'react-icons/fi';
import { notify } from '../../utils/notify';   // ✅ correct
import api from '../../utils/api';
import StatCard from '../../components/admin/StatCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // ✅ Guard: skip fetch if no admin token
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/admin/stats');
        if (response.data.success) {
          setStats(response.data.stats);
          setRecentOrders(response.data.recentOrders || []);
        }
      } catch (error) {
        console.error('❌ Error fetching stats:', error);
        // ✅ Don't toast on auth failures (AdminLayout handles redirect)
        if (
          error.response?.status !== 401 &&
          error.response?.status !== 403
        ) {
          notify.error('Failed to load dashboard stats');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
      <h1 className="font-serif text-2xl lg:text-3xl mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon={FiDollarSign}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={FiShoppingBag}
          color="yellow"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={FiPackage}
          color="blue"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={FiUsers}
          color="purple"
        />
      </div>

      {/* Recent Orders */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-serif text-xl">Recent Orders</h2>
            <Link
            to="/admin/orders"
            className="text-sm text-yellow-600 hover:text-yellow-700 transition flex items-center gap-1"
            >
            View All <FiChevronRight size={16} />
            </Link>
        </div>

        {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
            No orders yet
            </div>
        ) : (
            <div>
            {/* ✅ Grid Header - Desktop only */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-cream border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <div className="col-span-3">Order</div>
                <div className="col-span-3">Customer</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Total</div>
            </div>

            {/* ✅ Order Rows - Grid */}
            <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                <div
                    key={order._id}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 py-4 items-center hover:bg-cream transition cursor-pointer"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                >
                    {/* Order ID */}
                    <div className="lg:col-span-3">
                    <p className="text-xs text-gray-400 lg:hidden">Order</p>
                    <p className="text-sm font-medium">
                        #{order._id?.slice(-8).toUpperCase()}
                    </p>
                    </div>

                    {/* Customer */}
                    <div className="lg:col-span-3 min-w-0">
                    <p className="text-xs text-gray-400 lg:hidden">Customer</p>
                    <p className="text-sm text-gray-500 truncate">
                        {order.user?.email || order.address?.email || 'Guest'}
                    </p>
                    </div>

                    {/* Date */}
                    <div className="lg:col-span-2">
                    <p className="text-xs text-gray-400 lg:hidden">Date</p>
                    <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        })}
                    </p>
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-2">
                    <p className="text-xs text-gray-400 lg:hidden">Status</p>
                    <span
                        className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                        order.orderStatus === 'Delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.orderStatus === 'Shipped'
                            ? 'bg-blue-100 text-blue-700'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                        {order.orderStatus}
                    </span>
                    </div>

                    {/* Total */}
                    <div className="lg:col-span-2 lg:text-right">
                    <p className="text-xs text-gray-400 lg:hidden">Total</p>
                    <p className="font-semibold text-yellow-600">
                        ${order.total?.toFixed(2)}
                    </p>
                    </div>
                </div>
                ))}
            </div>
        </div>
        )}
        </div>
    </div>
  );
};

export default Dashboard;