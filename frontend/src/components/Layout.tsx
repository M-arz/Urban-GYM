import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Dumbbell,
  ShieldCheck,
  UserCheck,
  UserCircle,
  ScanLine,
  Building2,
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = {
    member: [
      { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
      { to: '/instalaciones', icon: <Building2 size={20} />, label: 'Instalaciones' },
      { to: '/perfil', icon: <UserCircle size={20} />, label: 'Mi Perfil' },
    ],
    admin: [
      { to: '/admin', icon: <ShieldCheck size={20} />, label: 'Panel Admin' },
      { to: '/admin/socios', icon: <Users size={20} />, label: 'Socios' },
      { to: '/admin/instalaciones', icon: <Building2 size={20} />, label: 'Instalaciones' },
      { to: '/admin/validar-qr', icon: <ScanLine size={20} />, label: 'Validar Acceso QR' },
    ],
    trainer: [
      { to: '/trainer', icon: <UserCheck size={20} />, label: 'Mi Panel' },
      { to: '/trainer/socios', icon: <Users size={20} />, label: 'Mis Socios' },
      { to: '/instalaciones', icon: <Building2 size={20} />, label: 'Instalaciones' },
    ],
  };

  const items = navItems[user?.role as keyof typeof navItems] || navItems.member;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
          <Dumbbell size={28} className="text-indigo-400" />
          <span className="text-xl font-bold text-white">UrbanGym</span>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-700">
          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-600 text-white capitalize">
            {user?.role}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <h1 className="text-gray-500 text-sm">
            Bienvenido de vuelta,{' '}
            <span className="font-semibold text-gray-800">{user?.name}</span>
          </h1>
          <span className="text-xs text-gray-400">
            UrbanGym Platform · {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
