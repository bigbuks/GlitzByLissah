/* eslint-disable no-unused-vars */
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiHome,
  FiPenTool,
} from 'react-icons/fi';
import LissahLogo from '../../assets/LissahLogo.png';

const AdminSidebar = () => {
  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
    { to: '/admin/products', label: 'Products', icon: FiPackage },
    { to: '/admin/users', label: 'Users', icon: FiUsers },
    { to: '/admin/custom-inquiries', label: 'Custom Inquiries', icon: FiPenTool },
  ];

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      isActive
        ? 'bg-yellow-500 text-gray-900 font-medium'
        : 'text-gray-700 hover:bg-yellow-50'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <img src={LissahLogo} alt="Lissah" className="w-20" />
        <p className="text-xs text-gray-400 mt-2">Admin Panel</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkStyle}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Back to Store */}
      <div className="p-4 border-t border-gray-100">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <FiHome size={16} />
          <span>Back to Store</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;