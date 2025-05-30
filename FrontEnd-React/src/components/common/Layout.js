import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import useAuth from '../../hooks/useAuth';

const Layout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
