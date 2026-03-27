import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { workoutsApi } from '../api/api';
import { Dumbbell, Flame, Clock, Activity, Zap } from 'lucide-react';

interface Workout {
  id: string;
  machine_id: string;
  member_id: string;
  duration_minutes: number;
  calories: number;
  normalized_event: {
    machine_name: string;
    machine_type: string;
    metrics: {
      distance_km: number | null;
      avg_heart_rate: number | null;
      max_speed_kmh: number | null;
      resistance_level: number | null;
      reps: number | null;
      sets: number | null;
    };
  };
  event_type: string;
  created_at: string;
}

interface Stats {
  total_workouts: number;
  total_minutes: number;
  total_calories: number;
}

export default function WorkoutsPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin' || user?.role === 'trainer';

  useEffect(() => {
    if (!user) return;

    if (isAdmin) {
      workoutsApi.getAll()
        .then(({ data }) => setWorkouts(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      Promise.all([
        workoutsApi.getByMember(user.id),
        workoutsApi.getStats(user.id),
      ]).then(([{ data: w }, { data: s }]) => {
        setWorkouts(w);
        setStats(s);
      }).catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  const typeColor = (type: string) => {
    if (type === 'cardio') return 'bg-blue-100 text-blue-700';
    if (type === 'pesas') return 'bg-orange-100 text-orange-700';
    return 'bg-purple-100 text-purple-700';
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mis Entrenamientos</h1>
        <p className="text-gray-500 mt-1">Historial de actividad registrada por las máquinas.</p>
      </div>

      {/* Stats — solo para miembros */}
      {!isAdmin && stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Dumbbell size={22} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total sesiones</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total_workouts}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock size={22} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Minutos totales</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total_minutes}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Flame size={22} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Calorías quemadas</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total_calories}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de entrenamientos */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
          <Activity size={17} className="text-indigo-500" />
          <h2 className="font-semibold text-gray-800 text-sm">
            {isAdmin ? 'Todos los entrenamientos' : 'Historial de sesiones'}
          </h2>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 p-6">Cargando entrenamientos...</p>
        ) : workouts.length === 0 ? (
          <div className="p-10 text-center">
            <Dumbbell size={36} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No hay entrenamientos registrados aún.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Máquina</th>
                <th className="px-5 py-3 text-left">Tipo</th>
                <th className="px-5 py-3 text-center">Duración</th>
                <th className="px-5 py-3 text-center">Calorías</th>
                <th className="px-5 py-3 text-center">Métricas</th>
                <th className="px-5 py-3 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {workouts.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {w.normalized_event?.machine_name ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${typeColor(w.normalized_event?.machine_type ?? '')}`}>
                      {w.normalized_event?.machine_type ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-gray-700">
                    <span className="flex items-center justify-center gap-1">
                      <Clock size={12} className="text-gray-400" /> {w.duration_minutes} min
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-gray-700">
                    <span className="flex items-center justify-center gap-1">
                      <Flame size={12} className="text-red-400" /> {w.calories} kcal
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-gray-500">
                    {w.normalized_event?.metrics?.distance_km && (
                      <span className="mr-2">📍 {w.normalized_event.metrics.distance_km} km</span>
                    )}
                    {w.normalized_event?.metrics?.avg_heart_rate && (
                      <span className="mr-2">❤️ {w.normalized_event.metrics.avg_heart_rate} bpm</span>
                    )}
                    {w.normalized_event?.metrics?.reps && (
                      <span>🔁 {w.normalized_event.metrics.reps} reps</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-400 text-xs">
                    {new Date(w.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
