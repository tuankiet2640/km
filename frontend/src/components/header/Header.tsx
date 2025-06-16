import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import UserMenu from './UserMenu';
import { ShieldCheckIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import logo from '../../assets/images/logo.png'; // Make sure the path is correct

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Datasets', path: '/datasets' },
    { name: 'Models', path: '/models' },
    { name: 'Applications', path: '/applications' },
    { name: 'Chat', path: '/chat' },
  ];

    return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
              <img className="h-8 w-auto" src={logo} alt="Logo" />
              <span className="text-xl font-semibold text-gray-800 dark:text-white">
                MaxKB
              </span>
                                                </Link>
                                        </div>
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                {link.name}
              </NavLink>
                                            ))}
                                        </div>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
            <UserMenu />
            <div className="md:hidden flex items-center">
                                <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
                                                    </button>
            </div>
                        </div>
                    </div>
                        </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
                            ))}
                        </div>
                        </div>
                    )}
        </header>
    );
};

export default Header;