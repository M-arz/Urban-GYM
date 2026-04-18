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
  Activity,
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
      { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
      { to: '/entrenamientos', icon: <Activity size={18} />, label: 'Mis Entrenamientos' },
      { to: '/instalaciones', icon: <Building2 size={18} />, label: 'Instalaciones' },
      { to: '/perfil', icon: <UserCircle size={18} />, label: 'Mi Perfil' },
    ],
    admin: [
      { to: '/admin', icon: <ShieldCheck size={18} />, label: 'Panel Admin' },
      { to: '/admin/socios', icon: <Users size={18} />, label: 'Socios' },
      { to: '/admin/entrenamientos', icon: <Activity size={18} />, label: 'Entrenamientos IoT' },
      { to: '/admin/instalaciones', icon: <Building2 size={18} />, label: 'Instalaciones' },
      { to: '/admin/validar-qr', icon: <ScanLine size={18} />, label: 'Validar Acceso QR' },
    ],
    trainer: [
      { to: '/trainer', icon: <UserCheck size={18} />, label: 'Mi Panel' },
      { to: '/trainer/socios', icon: <Users size={18} />, label: 'Mis Socios' },
      { to: '/trainer/entrenamientos', icon: <Activity size={18} />, label: 'Entrenamientos IoT' },
      { to: '/instalaciones', icon: <Building2 size={18} />, label: 'Instalaciones' },
    ],
  };

  const items = navItems[user?.role as keyof typeof navItems] || navItems.member;

  const roleConfig = {
    admin: { label: 'Administrador', color: 'from-violet-500 to-purple-600' },
    trainer: { label: 'Entrenador', color: 'from-blue-500 to-cyan-600' },
    member: { label: 'Socio', color: 'from-indigo-500 to-blue-600' },
  };
  const role = roleConfig[user?.role as keyof typeof roleConfig] ?? roleConfig.member;

  return (
    <div className="flex h-screen" style={{ background: '#f0f2f8' }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col shadow-2xl"
        style={{ background: 'linear-gradient(180deg, #0f0c29 0%, #1a1044 50%, #24243e 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Dumbbell size={22} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-wide">UrbanGym</span>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Platform</p>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 mx-3 my-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: `linear-gradient(135deg, var(--tw-gradient-from, #6366f1), var(--tw-gradient-to, #8b5cf6))`, backgroundImage: `linear-gradient(135deg, #6366f1, #8b5cf6)` }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.email}</p>
            </div>
          </div>
          <div className="mt-2">
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {role.label}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'hover:text-white'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }
                  : { color: 'rgba(255,255,255,0.55)' }
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)';
              (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
            }}
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="px-8 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(99,102,241,0.1)',
            boxShadow: '0 1px 20px rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} />
            <h1 className="text-gray-500 text-sm">
              Bienvenido de vuelta,{' '}
              <span className="font-bold text-gray-800">{user?.name}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-gray-400" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
