import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  BellIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showNotification('Sesión cerrada exitosamente', 'success');
      navigate('/login');
    } catch (error) {
      showNotification('Error al cerrar sesión', 'error');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">DA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DocuControl AI</h1>
                <p className="text-xs text-gray-500">Sistema Municipal Inteligente</p>
              </div>
            </Link>
          </div>

          {/* Menu de usuario */}
          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-400 ring-2 ring-white"></span>
            </button>

            {/* Perfil de usuario */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.rol}</p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <Link
                      to="/perfil"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <UserIcon className="h-4 w-4 mr-3" />
                      Mi Perfil
                    </Link>
                    <Link
                      to="/configuracion"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-3" />
                      Configuración
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
