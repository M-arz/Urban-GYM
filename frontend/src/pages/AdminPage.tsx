import { useEffect, useState } from 'react';
import { membersApi, classesApi, schedulesApi } from '../api/api';
import { Users, CheckCircle, Dumbbell, CalendarDays, Loader2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  roles: { name: string };
}

interface Schedule {
  id: string;
  date: string;
  start_time: string;
  available_spots: number;
  classes: {
    name: string;
    instructor: string;
    capacity: number;
    duration_minutes: number;
  };
}

interface Class {
  id: string;
  name: string;
  instructor: string;
  capacity: number;
}

export default function AdminPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([membersApi.getAll(), schedulesApi.getAll(), classesApi.getAll()])
      .then(([m, s, c]) => {
        setMembers(m.data);
        setSchedules(s.data);
        setClasses(c.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  const activeMembers = members.filter((m) => m.subscription_status === 'active');
  const inactiveMembers = members.filter((m) => m.subscription_status !== 'active');
  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  // Datos para gráfico de ocupación por clase
  const occupancyData = classes.map((cls) => {
    const classSchedules = schedules.filter((s) => s.classes?.name === cls.name);
    const totalCapacity = classSchedules.reduce((acc, s) => acc + (cls.capacity || 10), 0);
    const occupiedSpots = classSchedules.reduce((acc, s) => acc + ((cls.capacity || 10) - s.available_spots), 0);
    const occupancy = totalCapacity > 0 ? Math.round((occupiedSpots / totalCapacity) * 100) : 0;
    return { name: cls.name, ocupacion: occupancy, disponibles: classSchedules.length };
  });

  const kpis = [
    { label: 'Total Socios', value: members.length, icon: <Users size={22} />, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Socios Activos', value: activeMembers.length, icon: <CheckCircle size={22} />, color: 'bg-green-100 text-green-600' },
    { label: 'Socios Inactivos', value: inactiveMembers.length, icon: <TrendingUp size={22} />, color: 'bg-red-100 text-red-600' },
    { label: 'Clases Ofertadas', value: classes.length, icon: <Dumbbell size={22} />, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Horarios Activos', value: schedules.length, icon: <CalendarDays size={22} />, color: 'bg-blue-100 text-blue-600' },
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  // Evolución de nuevos socios por mes
  const evolutionData = (() => {
    const counts: Record<string, number> = {};
    members.forEach((m) => {
      const key = new Date(m.created_at).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([mes, nuevos]) => ({ mes, nuevos }));
  })();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
        <p className="text-gray-500 mt-1">Visión global de la plataforma UrbanGym</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className={`inline-flex p-2 rounded-lg mb-3 ${kpi.color}`}>{kpi.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de ocupación */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Ocupación por Clase</h2>
        <p className="text-sm text-gray-500 mb-6">Porcentaje de cupos ocupados por tipo de clase</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={occupancyData} barSize={40}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, 'Ocupación']} />
            <Bar dataKey="ocupacion" radius={[6, 6, 0, 0]}>
              {occupancyData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico evolución de socios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Evolución de Nuevos Socios</h2>
        <p className="text-sm text-gray-500 mb-6">Registro de nuevos socios por mes</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={evolutionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${value} socios`, 'Nuevos']} />
            <Legend />
            <Line type="monotone" dataKey="nuevos" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} name="Nuevos socios" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Distribución de socios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Estado de Suscripciones</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Activos</span>
                <span className="font-semibold text-green-600">{activeMembers.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: members.length ? `${(activeMembers.length / members.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Inactivos</span>
                <span className="font-semibold text-red-500">{inactiveMembers.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-red-400 h-2 rounded-full transition-all"
                  style={{ width: members.length ? `${(inactiveMembers.length / members.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Próximas Clases</h3>
          <div className="space-y-2">
            {schedules.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-800">{s.classes?.name}</span>
                  <span className="text-gray-400 ml-2">{s.start_time?.slice(0, 5)}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.available_spots > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {s.available_spots} cupos
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de socios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Listado de Socios</h2>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Nombre</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Teléfono</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Rol</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Plan</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Estado</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{member.name}</td>
                  <td className="px-6 py-4 text-gray-600">{member.email}</td>
                  <td className="px-6 py-4 text-gray-600">{member.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 capitalize">
                      {member.roles?.name || 'member'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{member.subscription_plan || 'básico'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${member.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {member.subscription_status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(member.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-gray-400">No se encontraron socios.</div>
          )}
        </div>
      </div>
    </div>
  );
}
