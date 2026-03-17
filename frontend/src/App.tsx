import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000'; // Apunta al API Gateway

// Interfaces
interface Member {
  id: string;
  nombre: string;
  email: string;
  fecha_registro: string;
  subscriptionStatus: string;
}

interface Booking {
  id: number;
  memberId: number;
  fecha: string;
  hora: string;
  tipo: string;
}

export default function App() {
  const [tab, setTab] = useState<'members' | 'bookings'>('members');
  const [members, setMembers] = useState<Member[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Form states
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [memberId, setMemberId] = useState('');
  const [tipo, setTipo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  // Notificaciones
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchMembers();
    fetchBookings();
  }, []);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch(`${API_URL}/members`);
      if (!res.ok) throw new Error('Error fetching members');
      const data = await res.json();
      setMembers(data);
    } catch (e: any) {
      console.error(e);
      showToast('Error cargando miembros. Asegúrese de que el backend esté corriendo.', 'error');
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch(`${API_URL}/bookings`);
      if (!res.ok) throw new Error('Error fetching bookings');
      const data = await res.json();
      setBookings(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error registrando miembro');
      
      showToast('Socio registrado con éxito');
      setNombre(''); setEmail(''); setPassword('');
      fetchMembers();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: Number(memberId), tipo, fecha, hora }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error creando reserva');
      
      showToast('Reserva confirmada');
      setMemberId(''); setTipo(''); setFecha(''); setHora('');
      fetchBookings();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleDeleteBooking = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error cancelando reserva');
      showToast('Reserva cancelada exitosamente');
      fetchBookings();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white text-xl shadow-md">
              🏋️
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Urban<span className="text-brand-600">GYM</span></h1>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-sm border border-slate-200">
            Admin Panel
          </span>
        </div>
      </header>

      {/* ── Tabs & Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-max mb-8 border border-slate-200">
          <button
            onClick={() => setTab('members')}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              tab === 'members' 
                ? 'bg-white text-brand-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <span>👤</span> Miembros
          </button>
          <button
            onClick={() => setTab('bookings')}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              tab === 'bookings' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <span>📅</span> Reservas
          </button>
        </div>

        {/* ======== MEMBERS VIEW ======== */}
        {tab === 'members' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-brand-100 text-brand-600 rounded-lg">➕</span> Registrar Miembro
              </h2>
              <form onSubmit={handleRegisterMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Ej: Juan García" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="juan@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••" />
                </div>
                <button type="submit" 
                  className="w-full mt-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                  Registrar Miembro
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold m-0 text-slate-800">📋 Directorio de Socios</h2>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold border border-slate-200">
                  {members.length} registros
                </span>
              </div>
              <div className="p-4" style={{ minHeight: '300px' }}>
                {loadingMembers ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <span className="text-4xl block mb-3 opacity-50">👤</span>
                    <p className="text-sm">No hay miembros registrados aún.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map(m => (
                      <div key={m.id} className="flex items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-brand-200 hover:shadow-sm transition-all group">
                        <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
                          {m.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{m.nombre}</p>
                          <p className="text-sm text-slate-500 truncate">{m.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            m.subscriptionStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {m.subscriptionStatus}
                          </span>
                          <p className="text-xs text-slate-400 mt-1 font-mono">ID: {m.id.split('-')[0]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======== BOOKINGS VIEW ======== */}
        {tab === 'bookings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">➕</span> Nueva Reserva
              </h2>
              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ID del Miembro (Temporal UUID/Num)</label>
                  <input type="text" value={memberId} onChange={e => setMemberId(e.target.value)} required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Ej: 1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Clase</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value)} required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white">
                    <option value="" disabled>Selecciona una clase...</option>
                    <option value="Yoga">🧘 Yoga</option>
                    <option value="CrossFit">💪 CrossFit</option>
                    <option value="Spinning">🚴 Spinning</option>
                    <option value="Pilates">🤸 Pilates</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                    <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                    <input type="time" value={hora} onChange={e => setHora(e.target.value)} required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                </div>
                <button type="submit" 
                  className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Confirmar Reserva
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold m-0 text-slate-800">📅 Agenda de Clases</h2>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold border border-slate-200">
                  {bookings.length} reservas
                </span>
              </div>
              <div className="p-4" style={{ minHeight: '300px' }}>
                {loadingBookings ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <span className="text-4xl block mb-3 opacity-50">📅</span>
                    <p className="text-sm">No hay reservas activas en el sistema.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map(b => (
                      <div key={b.id} className="flex items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          <span className="text-sm font-bold leading-tight">{b.hora.split(':')[0]}</span>
                          <span className="text-[10px] uppercase opacity-80 leading-tight">hrs</span>
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{b.tipo}</p>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200">
                              Socio #{b.memberId}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">🗓️ {b.fecha} a las {b.hora}</p>
                        </div>
                        <button onClick={() => handleDeleteBooking(b.id)}
                          className="ml-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancelar reseva">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
          <div className={`px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 border ${
            toast.type === 'success' ? 'bg-white border-emerald-100' : 'bg-red-50 border-red-200'
          }`}>
            <span className={toast.type === 'success' ? 'text-emerald-500' : 'text-red-500'}>
              {toast.type === 'success' ? '✅' : '❌'}
            </span>
            <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-slate-800' : 'text-red-900'}`}>
              {toast.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
