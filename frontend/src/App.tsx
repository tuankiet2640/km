import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from 'react-router-dom';
import React, { useEffect } from 'react';

import { useUIStore } from '@/stores/ui';

import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Datasets } from '@/pages/Datasets';
import { Applications } from '@/pages/Applications';
import { Models } from '@/pages/Models';
import { Chat } from '@/pages/Chat';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Header from '@/components/header/Header';

const AppLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto relative z-0">
        <Outlet />
      </main>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'datasets',
        element: <Datasets />,
      },
      {
        path: 'models',
        element: <Models />,
      },
      {
        path: 'applications',
        element: <Applications />,
      },
      {
        path: 'chat/:id?',
        element: <Chat />,
      },
    ],
  },
]);

function App() {
  const isDark = useUIStore((state) => state.isDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="font-bodyFont h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <RouterProvider router={router} />
    </div>
  );
}

export default App; 