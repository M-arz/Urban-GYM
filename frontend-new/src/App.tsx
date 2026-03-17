import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = 'http://localhost:3000';

// Tipos
interface Member {
  id: string;
  nombre: string;
  email: string;
}

interface Booking {
  id: number;
  memberId: number;
  fecha: string;
  hora: string;
  tipo: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'members' | 'bookings'>('members');
  const [members, setMembers] = useState<Member[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [memberForm, setMemberForm] = useState({ nombre: '', email: '', password: '' });
  const [bookingForm, setBookingForm] = useState({ memberId: '', tipo: '', fecha: '', hora: '' });
  
  // Status check
  const [gatewayStatus, setGatewayStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    checkStatus();
    loadData();
  }, []);

  const checkStatus = async () => {
    try {
      await axios.get(`${API_URL}/members`);
      setGatewayStatus('online');
    } catch {
      setGatewayStatus('offline');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/members`),
        axios.get(`${API_URL}/bookings`)
      ]);
      setMembers(membersRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error loading data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/register`, memberForm);
      alert('Miembro registrado con éxito 🎉');
      setMemberForm({ nombre: '', email: '', password: '' });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al registrar miembro');
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/bookings`, {
        ...bookingForm,
        memberId: parseInt(bookingForm.memberId)
      });
      alert('Reserva creada con éxito 📅');
      setBookingForm({ memberId: '', tipo: '', fecha: '', hora: '' });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message?.[0] || error.response?.data?.message || 'Error al crear reserva');
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('¿Seguro de cancelar esta reserva?')) return;
    try {
      await axios.delete(`${API_URL}/bookings/${id}`);
      loadData();
    } catch (error) {
      alert('Error al cancelar la reserva');
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          <span className="text-4xl">🏋️</span> UrbanGYM
        </div>
        <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-full shadow-lg border border-slate-700">
          <div className={`w-3 h-3 rounded-full shadow-lg animate-pulse ${gatewayStatus === 'online' ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
          <span className="text-sm font-medium text-slate-300 tracking-wide uppercase">
            Gateway: {gatewayStatus}
          </span>
        </div>
      </header>

      {/* TABS */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
            activeTab === 'members' 
            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-100' 
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white scale-95'
          }`}
        >
          👤 Gestión de Miembros
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
            activeTab === 'bookings' 
            ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-100' 
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white scale-95'
          }`}
        >
          📅 Reservas de Clases
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <main>
          
          {/* MEMBERS VIEW */}
          {activeTab === 'members' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form */}
              <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl h-fit">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">➕ Nuevo Miembro</h2>
                <form onSubmit={handleCreateMember} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2 ml-1">Nombre Completo</label>
                    <input required type="text" value={memberForm.nombre} onChange={e => setMemberForm({...memberForm, nombre: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-slate-600" placeholder="Ej: Juan Pérez"/>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2 ml-1">Correo Electrónico</label>
                    <input required type="email" value={memberForm.email} onChange={e => setMemberForm({...memberForm, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-slate-600" placeholder="juan@email.com"/>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2 ml-1">Contraseña</label>
                    <input required minLength={6} type="password" value={memberForm.password} onChange={e => setMemberForm({...memberForm, password: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-slate-600" placeholder="••••••••"/>
                  </div>
                  <button type="submit" className="mt-4 bg-white text-black font-bold text-lg py-4 rounded-xl hover:bg-slate-200 transition-transform active:scale-95">Registrar Miembro</button>
                </form>
              </div>

              {/* List */}
              <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">📋 Miembros Activos</h2>
                  <span className="bg-purple-500/20 text-purple-300 px-4 py-1 rounded-full text-sm font-bold border border-purple-500/30">Total: {members.length}</span>
                </div>
                
                <div className="grid gap-4">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-5 p-5 bg-slate-900/50 hover:bg-slate-800 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all group">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/20">
                        {m.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg text-white mb-1 group-hover:text-purple-300 transition-colors">{m.nombre}</div>
                        <div className="text-sm text-slate-400 font-mono">{m.email}</div>
                      </div>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <div className="text-center py-16 text-slate-500 italic">No hay miembros registrados aún.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BOOKINGS VIEW */}
          {activeTab === 'bookings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form */}
              <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl h-fit">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">➕ Nueva Reserva</h2>
                <form onSubmit={handleCreateBooking} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2 ml-1">ID del Miembro</label>
                    <input required type="number" min="1" value={bookingForm.memberId} onChange={e => setBookingForm({...bookingForm, memberId: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-600" placeholder="Ej: 1"/>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2 ml-1">Tipo de Clase</label>
                    <select required value={bookingForm.tipo} onChange={e => setBookingForm({...bookingForm, tipo: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none cursor-pointer">
                      <option value="" disabled>Selecciona una disciplina...</option>
                      <option value="Yoga">🧘‍♀️ Yoga</option>
                      <option value="CrossFit">🏋️‍♂️ CrossFit</option>
                      <option value="Spinning">🚴‍♀️ Spinning</option>
                      <option value="Pilates">🤸‍♀️ Pilates</option>
                      <option value="Boxeo">🥊 Boxeo</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2 ml-1">Fecha</label>
                      <input required type="date" value={bookingForm.fecha} onChange={e => setBookingForm({...bookingForm, fecha: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"/>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2 ml-1">Hora</label>
                      <input required type="time" value={bookingForm.hora} onChange={e => setBookingForm({...bookingForm, hora: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"/>
                    </div>
                  </div>
                  <button type="submit" className="mt-4 bg-white text-black font-bold text-lg py-4 rounded-xl hover:bg-slate-200 transition-transform active:scale-95">Agendar Clase</button>
                </form>
              </div>

              {/* List */}
              <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">📋 Reservas Pendientes</h2>
                  <span className="bg-cyan-500/20 text-cyan-300 px-4 py-1 rounded-full text-sm font-bold border border-cyan-500/30">Total: {bookings.length}</span>
                </div>
                
                <div className="grid gap-4">
                  {bookings.map(b => (
                    <div key={b.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 bg-slate-900/50 hover:bg-slate-800 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all group">
                      
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-lg text-xs font-mono border border-slate-700">Ref #{b.id}</span>
                          <span className="bg-cyan-900/50 text-cyan-300 px-3 py-1 rounded-lg text-sm font-bold border border-cyan-700/50 block w-max">{b.tipo}</span>
                        </div>
                        <div className="text-lg text-white font-medium">Miembro ID <span className="text-cyan-400">#{b.memberId}</span></div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          {b.fecha} a las {b.hora}
                        </div>
                      </div>

                      <button onClick={() => handleDeleteBooking(b.id)} className="w-full sm:w-auto mt-4 sm:mt-0 px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-medium transition-colors border border-red-500/20 hover:border-red-500">
                        Cancelar
                      </button>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="text-center py-16 text-slate-500 italic">No hay clases programadas.</div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      )}
    </div>
  )
}

export default App
