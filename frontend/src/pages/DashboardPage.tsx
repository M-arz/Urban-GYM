import { useEffect, useState } from 'react';
import { schedulesApi, bookingsApi, waitlistApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Clock, Users, CheckCircle, XCircle, Loader2, ListOrdered } from 'lucide-react';

interface Schedule {
  id: string;
  date: string;
  start_time: string;
  available_spots: number;
  classes: {
    name: string;
    instructor: string;
    duration_minutes: number;
  };
}

interface Booking {
  id: string;
  status: string;
  created_at: string;
  schedules: {
    date: string;
    start_time: string;
    classes: {
      name: string;
      instructor: string;
      duration_minutes: number;
    };
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [waitlistId, setWaitlistId] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      const { data } = await schedulesApi.getAll();
      setSchedules(data);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await bookingsApi.getMy();
      setBookings(data);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchWaitlist = async () => {
    try {
      const { data } = await waitlistApi.getMy();
      setWaitlist(data);
    } catch {}
  };

  useEffect(() => {
    fetchSchedules();
    fetchBookings();
    fetchWaitlist();
  }, []);

  const handleBook = async (scheduleId: string) => {
    setBookingId(scheduleId);
    try {
      await bookingsApi.create(scheduleId);
      await Promise.all([fetchSchedules(), fetchBookings(), fetchWaitlist()]);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Error al reservar');
    } finally {
      setBookingId(null);
    }
  };

  const handleJoinWaitlist = async (scheduleId: string) => {
    setWaitlistId(scheduleId);
    try {
      await waitlistApi.join(scheduleId);
      await fetchWaitlist();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Error al unirse a la lista de espera');
    } finally {
      setWaitlistId(null);
    }
  };

  const handleLeaveWaitlist = async (id: string) => {
    try {
      await waitlistApi.leave(id);
      await fetchWaitlist();
    } catch {
      alert('Error al salir de la lista de espera');
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    try {
      await bookingsApi.cancel(bookingId);
      await Promise.all([fetchSchedules(), fetchBookings()]);
    } catch {
      alert('Error al cancelar la reserva');
    }
  };

  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const confirmedScheduleIds = new Set(activeBookings.map((b) => b.schedules?.date + b.schedules?.start_time));
  const waitlistScheduleIds = new Set(waitlist.map((w) => w.schedule_id));

  const classColors: Record<string, string> = {
    Yoga: 'bg-purple-100 text-purple-700',
    Spinning: 'bg-yellow-100 text-yellow-700',
    CrossFit: 'bg-red-100 text-red-700',
    Boxeo: 'bg-orange-100 text-orange-700',
    Pilates: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Hola, {user?.name} 👋</h1>
        <p className="text-gray-500 mt-1">Aquí puedes ver las clases disponibles y gestionar tus reservas.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <CalendarDays size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{activeBookings.length}</p>
              <p className="text-sm text-gray-500">Reservas Activas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{schedules.length}</p>
              <p className="text-sm text-gray-500">Clases Disponibles</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ListOrdered size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{waitlist.length}</p>
              <p className="text-sm text-gray-500">En Lista de Espera</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clases disponibles */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Clases Disponibles</h2>
        {loadingSchedules ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
            No hay clases disponibles por ahora.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((schedule) => {
              const alreadyBooked = confirmedScheduleIds.has(schedule.date + schedule.start_time);
              const colorClass = classColors[schedule.classes?.name] || 'bg-gray-100 text-gray-700';
              return (
                <div key={schedule.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                      {schedule.classes?.name}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${schedule.available_spots > 5 ? 'bg-green-100 text-green-700' : schedule.available_spots > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {schedule.available_spots} cupos
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{schedule.classes?.instructor}</p>
                    <p className="text-sm text-gray-500">{schedule.classes?.duration_minutes} minutos</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={14} />
                      {new Date(schedule.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {schedule.start_time.slice(0, 5)}
                    </span>
                  </div>
                  {schedule.available_spots > 0 ? (
                    <button
                      onClick={() => handleBook(schedule.id)}
                      disabled={alreadyBooked || bookingId === schedule.id}
                      className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                        alreadyBooked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {bookingId === schedule.id && <Loader2 size={14} className="animate-spin" />}
                      {alreadyBooked ? 'Ya reservado' : 'Reservar'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinWaitlist(schedule.id)}
                      disabled={waitlistScheduleIds.has(schedule.id) || waitlistId === schedule.id}
                      className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                        waitlistScheduleIds.has(schedule.id) ? 'bg-orange-50 text-orange-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      {waitlistId === schedule.id && <Loader2 size={14} className="animate-spin" />}
                      <ListOrdered size={14} />
                      {waitlistScheduleIds.has(schedule.id) ? 'En lista de espera' : 'Lista de espera'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lista de espera */}
      {waitlist.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Mi Lista de Espera</h2>
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-orange-50 border-b border-orange-100">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-orange-700">Clase</th>
                  <th className="px-6 py-3 text-left font-medium text-orange-700">Instructor</th>
                  <th className="px-6 py-3 text-left font-medium text-orange-700">Fecha</th>
                  <th className="px-6 py-3 text-left font-medium text-orange-700">Hora</th>
                  <th className="px-6 py-3 text-left font-medium text-orange-700">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {waitlist.map((entry) => (
                  <tr key={entry.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{entry.schedules?.classes?.name}</td>
                    <td className="px-6 py-4 text-gray-600">{entry.schedules?.classes?.instructor}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(entry.schedules?.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{entry.schedules?.start_time?.slice(0, 5)}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleLeaveWaitlist(entry.id)} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                        <XCircle size={13} /> Salir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mis Reservas */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Mis Reservas</h2>
        {loadingBookings ? (
          <div className="flex justify-center py-8">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
            No tienes reservas aún.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Clase</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Instructor</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Fecha</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Hora</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Estado</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{booking.schedules?.classes?.name}</td>
                    <td className="px-6 py-4 text-gray-600">{booking.schedules?.classes?.instructor}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(booking.schedules?.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{booking.schedules?.start_time?.slice(0, 5)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {booking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          <XCircle size={14} />
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
