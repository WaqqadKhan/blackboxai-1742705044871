import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faPaperPlane,
  faHistory,
  faExchangeAlt,
  faCog,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../App';

const Navigation = () => {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: faHome },
    { path: '/payment', name: 'Send Money', icon: faPaperPlane },
    { path: '/transactions', name: 'History', icon: faHistory },
    { path: '/exchange', name: 'Exchange', icon: faExchangeAlt },
    { path: '/settings', name: 'Settings', icon: faCog }
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <span className="font-bold text-xl">PaymentApp</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 ${isActive(item.path)}`}
              >
                <FontAwesomeIcon icon={item.icon} className="mr-2" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto space-x-4 pb-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 ${isActive(item.path)}`}
            >
              <FontAwesomeIcon icon={item.icon} className="mr-2" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;