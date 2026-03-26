import { useEffect, useState } from 'react';
import { membersApi, schedulesApi } from '../api/api';
import { User, Mail, Phone, CheckCircle, XCircle, CalendarDays, Loader2, Search } from 'lucide-react';

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
  classes: { name: string; instructor: string; duration_minutes: number };
}

export default function TrainerPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Member | null>(null);

  useEffect(() => {
    Promise.all([membersApi.getAll(), schedulesApi.getAll()])
      .then(([m, s]) => {
        setMembers(m.data);
        setSchedules(s.data);
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

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Panel del Entrenador</h1>
        <p className="text-gray-500 mt-1">Gestiona y monitorea el progreso de tus socios.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de socios */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar socio..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {filtered.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelected(member)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${selected?.id === member.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                >
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 font-semibold text-sm">{member.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${member.subscription_status === 'active' ? 'bg-green-500' : 'bg-red-400'}`} />
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-6">No se encontraron socios.</p>
              )}
            </div>
          </div>
        </div>

        {/* Detalle del socio */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              {/* Perfil */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-indigo-700">{selected.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800">{selected.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 capitalize">
                        {selected.roles?.name || 'member'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selected.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {selected.subscription_status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Mail size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="font-medium text-gray-800">{selected.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Phone size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Teléfono</p>
                      <p className="font-medium text-gray-800">{selected.phone || 'No registrado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <User size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Plan</p>
                      <p className="font-medium text-gray-800 capitalize">{selected.subscription_plan || 'Básico'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <CalendarDays size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Miembro desde</p>
                      <p className="font-medium text-gray-800">
                        {new Date(selected.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado de suscripción */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Estado del Socio</h3>
                <div className="flex items-center gap-3">
                  {selected.subscription_status === 'active' ? (
                    <CheckCircle size={40} className="text-green-500" />
                  ) : (
                    <XCircle size={40} className="text-red-400" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {selected.subscription_status === 'active' ? 'Suscripción Activa' : 'Suscripción Inactiva'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selected.subscription_status === 'active'
                        ? 'El socio tiene acceso completo a las instalaciones.'
                        : 'El socio no tiene acceso activo. Verificar pago.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Clases disponibles para asignar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Clases Disponibles para Asignar</h3>
                <div className="space-y-2">
                  {schedules.length === 0 ? (
                    <p className="text-sm text-gray-400">No hay clases disponibles.</p>
                  ) : (
                    schedules.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <span className="font-medium text-gray-800">{s.classes?.name}</span>
                          <span className="text-gray-500 ml-2">· {s.classes?.instructor}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                          <span>{new Date(s.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                          <span>{s.start_time?.slice(0, 5)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.available_spots > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {s.available_spots} cupos
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center h-full">
              <User size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-400 font-medium">Selecciona un socio</p>
              <p className="text-gray-300 text-sm mt-1">Haz clic en un socio de la lista para ver su perfil.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
