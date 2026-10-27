import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiSave,
} from 'react-icons/fi';
import { notify } from '../../utils/notify';   // ✅ correct
import api from '../../utils/api';

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/admin/orders`);
        if (response.data.success) {
          const found = response.data.orders.find((o) => o._id === orderId);
          if (found) {
            setOrder(found);
            setNewStatus(found.orderStatus);
            setTrackingNumber(found.trackingNumber || '');
          } else {
            notify.error('Order not found');
            navigate('/admin/orders');
          }
        }
      } catch (error) {
        console.error('❌ Error:', error);
        notify.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const response = await api.put(
        `/admin/orders/${orderId}/status`,
        {
          orderStatus: newStatus,
          trackingNumber,
        }
      );

      if (response.data.success) {
        notify.success('Order updated successfully');
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      notify.error('Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-500">
        Order not found
      </div>
    );
  }

  const statusOptions = [
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate('/admin/orders')}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition mb-6"
      >
        <FiArrowLeft size={18} />
        Back to Orders
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl">
              Order #{order._id?.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-2xl font-bold text-yellow-600">
              ${order.total?.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-serif text-xl mb-4 flex items-center gap-2">
              <FiPackage size={20} className="text-yellow-500" />
              Items
            </h2>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                      {item.size && ` | Size: ${item.size}`}
                    </p>
                  </div>
                  <p className="font-medium text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-serif text-xl mb-4 flex items-center gap-2">
              <FiMapPin size={20} className="text-yellow-500" />
              Shipping Address
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">
                {order.address?.firstName} {order.address?.lastName}
              </p>
              <p>{order.address?.street}</p>
              <p>
                {order.address?.city}, {order.address?.state}{' '}
                {order.address?.zipCode}
              </p>
              <p>{order.address?.country}</p>
              <p className="pt-2">
                <span className="text-gray-500">Phone:</span>{' '}
                {order.address?.phone}
              </p>
              <p>
                <span className="text-gray-500">Email:</span>{' '}
                {order.address?.email}
              </p>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-serif text-xl mb-4 flex items-center gap-2">
              <FiCreditCard size={20} className="text-yellow-500" />
              Payment
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="text-gray-500">Method:</span>{' '}
                {order.paymentMethod}
              </p>
              <p>
                <span className="text-gray-500">Status:</span>{' '}
                <span
                  className={`font-medium ${
                    order.paymentStatus === 'Paid'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Update Status */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="font-serif text-xl mb-4">Update Order</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="TRK-123456"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full bg-yellow-500 text-gray-900 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiSave size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;