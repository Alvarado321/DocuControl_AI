import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  ChartBarIcon,
  CpuChipIcon,
  UsersIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: [ROLES.CIUDADANO, ROLES.FUNCIONARIO, ROLES.ADMIN]
    },
    {
      name: 'Trámites',
      href: '/tramites',
      icon: DocumentTextIcon,
      roles: [ROLES.CIUDADANO, ROLES.FUNCIONARIO, ROLES.ADMIN]
    },
    {
      name: 'Mis Solicitudes',
      href: '/solicitudes',
      icon: ClipboardDocumentListIcon,
      roles: [ROLES.CIUDADANO, ROLES.FUNCIONARIO, ROLES.ADMIN]
    },
    {
      name: 'Documentos',
      href: '/documentos',
      icon: FolderIcon,
      roles: [ROLES.FUNCIONARIO, ROLES.ADMIN]
    },
    {
      name: 'Análisis ML',
      href: '/ml',
      icon: CpuChipIcon,
      roles: [ROLES.FUNCIONARIO, ROLES.ADMIN]
    },
    {
      name: 'Reportes',
      href: '/reportes',
      icon: ChartBarIcon,
      roles: [ROLES.FUNCIONARIO, ROLES.ADMIN]
    },
    {
      name: 'Usuarios',
      href: '/usuarios',
      icon: UsersIcon,
      roles: [ROLES.ADMIN]
    },
    {
      name: 'Administración',
      href: '/admin',
      icon: Cog6ToothIcon,
      roles: [ROLES.ADMIN]
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.rol)
  );

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg mt-16">
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href || 
                           location.pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon 
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-primary-600' : 'text-gray-400'
                  }`} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="bg-primary-50 rounded-lg p-3">
            <div className="flex items-center">
              <CpuChipIcon className="h-5 w-5 text-primary-600 mr-2" />
              <div>
                <p className="text-xs font-medium text-primary-900">IA Activa</p>
                <p className="text-xs text-primary-600">Procesando solicitudes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
