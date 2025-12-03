import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  NewspaperIcon,
  BellAlertIcon,
  CpuChipIcon,
  UserGroupIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/market', icon: ChartBarIcon, label: 'Market' },
    { path: '/news', icon: NewspaperIcon, label: 'News' },
    { path: '/alerts', icon: BellAlertIcon, label: 'Alerts' },
    { path: '/ai-analysis', icon: CpuChipIcon, label: 'AI Analysis' },
    { path: '/community', icon: UserGroupIcon, label: 'Community' },
    { path: '/settings', icon: CogIcon, label: 'Settings' },
  ];

  const isActive = (path) => location.pathname === path || 
    (path === '/dashboard' && location.pathname === '/');

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="p-2 bg-primary-600 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">StockAI</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg w-full">
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;