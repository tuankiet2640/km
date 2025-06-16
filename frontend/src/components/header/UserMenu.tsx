import React from 'react';
import { useAuthStore } from '@/stores/auth';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="relative">
      <button className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {user?.username || 'User'}
        </span>
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      </button>
      {/* Dropdown can be added here */}
    </div>
  );
};

export default UserMenu; 