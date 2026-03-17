import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [view, setView] = useState<'login' | 'register'>('login');
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'classes' | 'profile'>('classes');

  // Form states
  const [authForm, setAuthForm] = useState({ nombre: '', email: '', password: '' });

  useEffect(() => {
    if (token) {
      loadClasses();
      loadProfile();
    }
  }, [token]);

  const loadClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings/classes`);
      setClasses(res.data);
    } catch (error) {
      console.error('Error cargando clases', error);
    }
  };

  const loadProfile = async () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = view === 'login' ? '/auth/login' : '/auth/register';
    const payload = view === 'login' ? { email: authForm.email, password: authForm.password } : authForm;
    
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      const data = res.data;
      
      if (view === 'login') {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.member));
        setToken(data.access_token);
        setUser(data.member);
      } else {
        alert('Registro exitoso! Ahora puedes iniciar sesión.');
        setView('login');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (classe: any) => {
    try {
      await axios.post(`${API_URL}/bookings`, {
        miembroId: user.id || user.id_miembro,
        claseId: classe.idClase
      });
      alert(`Reserva confirmada para ${classe.nombreClase} 🎉`);
      loadClasses();
    } catch (error: any) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || 'Error al realizar la reserva');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">UrbanGYM</h1>
            <p className="text-slate-400 mt-2">{view === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {view === 'register' && (
              <div>
                <label className="block text-sm text-slate-400 mb-2 ml-1">Nombre Completo</label>
                <input required type="text" value={authForm.nombre} onChange={e => setAuthForm({...authForm, nombre: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-all" placeholder="Juan Pérez"/>
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-400 mb-2 ml-1">Correo Electrónico</label>
              <input required type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-all" placeholder="ejemplo@gym.com"/>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2 ml-1">Contraseña</label>
              <input required minLength={6} type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-all" placeholder="••••••••"/>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50">
              {loading ? 'Procesando...' : view === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-8 text-center text-slate-400">
            {view === 'login' ? (
              <p>¿No tienes cuenta? <button onClick={() => setView('register')} className="text-purple-400 font-bold hover:underline">Regístrate</button></p>
            ) : (
              <p>¿Ya tienes cuenta? <button onClick={() => setView('login')} className="text-purple-400 font-bold hover:underline">Inicia sesión</button></p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">UrbanGYM</h1>
            <div className="flex gap-4">
              <button onClick={() => setActiveTab('classes')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'classes' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Clases</button>
              <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Mi Perfil</button>
            </div>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-red-400 font-medium transition-colors">Cerrar Sesión</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'classes' ? (
          <div>
            <div className="mb-10">
              <h2 className="text-3xl font-bold">Reserva tu Clase</h2>
              <p className="text-slate-400 mt-2">Explora los horarios y asegura tu lugar físicamente en la base de datos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {classes.map((c) => (
                <div key={c.idClase} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-purple-500/50 transition-all group shadow-lg">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">🏋️</div>
                  <h3 className="text-xl font-bold mb-1">{c.nombreClase}</h3>
                  <p className="text-slate-400 text-sm mb-4">Entrenador: {c.entrenador}</p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium text-slate-500">Capacidad: {c.capacidad}</span>
                    <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: '70%' }}></div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleReserve(c)}
                    className="w-full py-3 rounded-xl font-bold transition-all bg-white text-black hover:bg-slate-200 active:scale-95"
                  >
                    Reservar Ahora
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-10">Tu Perfil</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl shadow-lg">👤</div>
                <div>
                  <h3 className="text-2xl font-bold">{user?.nombre || user?.nombre_miembro || 'Miembro Urban'}</h3>
                  <p className="text-slate-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
