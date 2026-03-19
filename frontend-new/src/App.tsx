import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

/* ─── Types ─────────────────────────────────────────────── */
interface ClassGym {
  idClase: number;
  nombreClase: string;
  entrenador: string;
  capacidad: number;
  horario?: string;
  tipo?: string;
}

interface Booking {
  idReserva: string;
  claseId: number;
  miembroId: string;
  fecha: string;
  estado: string;
}

interface UserData {
  id?: string;
  id_miembro?: string;
  nombre?: string;
  nombre_miembro?: string;
  email?: string;
  fecha_registro?: string;
  rol?: { nombre_rol?: string };
}

/* ─── Spinner ─────────────────────────────────────────────── */
const Spinner = () => (
  <span style={{
    display: 'inline-block', width: 18, height: 18,
    border: '2.5px solid rgba(255,255,255,0.25)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'spin 0.7s linear infinite', verticalAlign: 'middle'
  }} />
);

/* ─── Modal overlay ────────────────────────────────────────── */
const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}
  >
    <div onClick={e => e.stopPropagation()} style={{
      background: '#0f172a', border: '1px solid #1e293b',
      borderRadius: 24, padding: 32, width: '100%', maxWidth: 440,
      boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
    }}>
      {children}
    </div>
  </div>
);

/* ─── Input helper ─────────────────────────────────────────── */
const Field = ({
  label, value, onChange, type = 'text', readOnly = false, required = false, placeholder = ''
}: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; readOnly?: boolean; required?: boolean; placeholder?: string;
}) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>{label}</label>
    <input
      required={required}
      readOnly={readOnly}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange?.(e.target.value)}
      style={{
        width: '100%', padding: '12px 16px',
        background: readOnly ? '#0d1625' : '#1e293b',
        border: `1px solid ${readOnly ? '#1e293b' : '#334155'}`,
        borderRadius: 12, color: readOnly ? '#64748b' : '#fff',
        fontSize: 15, outline: 'none', boxSizing: 'border-box',
        cursor: readOnly ? 'not-allowed' : 'auto',
        transition: 'border-color 0.2s'
      }}
    />
  </div>
);

/* ════════════════════════════════════════════════════════════ */
function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [classes, setClasses] = useState<ClassGym[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'classes' | 'profile' | 'bookings'>('classes');
  const [loading, setLoading] = useState(false);

  // Auth form
  const [authForm, setAuthForm] = useState({ nombre: '', email: '', password: '' });

  // Booking modal
  const getLocalDateStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const [bookingTarget, setBookingTarget] = useState<ClassGym | null>(null);
  const [bookingForm, setBookingForm] = useState({
    fecha: getLocalDateStr(),
    notas: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  // Profile edit
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nombre: '', email: '',
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);

  /* ── Load on login ─────────────────────── */
  useEffect(() => {
    if (token) {
      loadClasses();
      loadProfile();
      loadBookings();
    }
    // eslint-disable-next-line
  }, [token]);

  const loadClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings/classes`);
      setClasses(res.data);
    } catch (err) {
      console.error('Error cargando clases', err);
    }
  };

  const loadProfile = async () => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      setProfileForm({
        nombre: u.nombre || u.nombre_miembro || '',
        email: u.email || '',
        currentPassword: '', newPassword: '', confirmPassword: '',
      });
    }
  };

  const loadBookings = async () => {
    const saved = localStorage.getItem('user');
    if (!saved) return;
    const u = JSON.parse(saved);
    const memberId = u.id || u.id_miembro;
    if (!memberId) return;
    try {
      // Fetch all bookings – filter client-side by member
      const res = await axios.get(`${API_URL}/bookings`);
      const all: Booking[] = res.data;
      setBookings(all.filter(b => b.miembroId === memberId));
    } catch (e) {
      console.error('Error cargando reservas', e);
    }
  };

  /* ── Auth ──────────────────────────────── */
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = authView === 'login' ? '/auth/login' : '/auth/register';
    const payload = authView === 'login'
      ? { email: authForm.email, password: authForm.password }
      : authForm;
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      const data = res.data;
      if (authView === 'login') {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.member));
        setToken(data.access_token);
        setUser(data.member);
      } else {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setAuthView('login');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setBookings([]);
    setClasses([]);
  };

  /* ── Booking ───────────────────────────── */
  const openBookingModal = (c: ClassGym) => {
    setBookingTarget(c);
    setBookingForm({ fecha: getLocalDateStr(), notas: '' });
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTarget || !user) return;
    setBookingLoading(true);
    try {
      await axios.post(`${API_URL}/bookings`, {
        miembroId: user.id || user.id_miembro,
        claseId: bookingTarget.idClase,
        // Agregamos 'T12:00:00' para forzar mediodía local y evitar desplazamiento de TZ
        fecha: new Date(`${bookingForm.fecha}T12:00:00`).toISOString(),
      });
      setBookingTarget(null);
      alert(`¡Reserva confirmada para ${bookingTarget.nombreClase}! 🎉`);
      loadBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al realizar la reserva');
    } finally {
      setBookingLoading(false);
    }
  };

  /* ── Profile update ────────────────────── */
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.id || user?.id_miembro;
    if (!userId) return;

    // Validate passwords match before sending
    const wantsPasswordChange = !!profileForm.newPassword || !!profileForm.currentPassword;
    if (wantsPasswordChange) {
      if (!profileForm.currentPassword) {
        setProfileMsg({ text: 'Debes ingresar tu contraseña actual.', ok: false }); return;
      }
      if (!profileForm.newPassword) {
        setProfileMsg({ text: 'Debes ingresar la nueva contraseña.', ok: false }); return;
      }
      if (profileForm.newPassword.length < 6) {
        setProfileMsg({ text: 'La nueva contraseña debe tener al menos 6 caracteres.', ok: false }); return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        setProfileMsg({ text: 'Las contraseñas nuevas no coinciden.', ok: false }); return;
      }
    }

    setProfileLoading(true);
    setProfileMsg(null);
    const payload: any = { nombre: profileForm.nombre, email: profileForm.email };
    if (wantsPasswordChange) {
      payload.currentPassword = profileForm.currentPassword;
      payload.newPassword = profileForm.newPassword;
    }
    try {
      const res = await axios.put(`${API_URL}/members/${userId}`, payload);
      const updated = res.data;
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setEditing(false);
      setProfileMsg({ text: '¡Perfil actualizado correctamente!', ok: true });
    } catch (err: any) {
      setProfileMsg({ text: err.response?.data?.message || 'Error al actualizar', ok: false });
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── Colour helpers ────────────────────── */
  const statusColor = (s: string) =>
    s === 'confirmada' ? '#22c55e' : s === 'pendiente' ? '#f59e0b' : '#ef4444';

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  const classNameForId = (id: number) =>
    classes.find(c => c.idClase === id)?.nombreClase || `Clase #${id}`;

  /* ════════ AUTH SCREEN ════════ */
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'system-ui,sans-serif' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width: '100%', maxWidth: 420, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 28, padding: 40, boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>UrbanGYM</h1>
            <p style={{ color: '#64748b', marginTop: 8 }}>{authView === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta gratis'}</p>
          </div>

          <form onSubmit={handleAuth}>
            {authView === 'register' && (
              <Field label="Nombre Completo" value={authForm.nombre} onChange={v => setAuthForm({ ...authForm, nombre: v })} required placeholder="Juan Pérez" />
            )}
            <Field label="Correo Electrónico" type="email" value={authForm.email} onChange={v => setAuthForm({ ...authForm, email: v })} required placeholder="ejemplo@gym.com" />
            <Field label="Contraseña" type="password" value={authForm.password} onChange={v => setAuthForm({ ...authForm, password: v })} required placeholder="••••••••" />
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#7c3aed,#db2777)', border: 'none', borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 8, transition: 'opacity 0.2s' }}
            >
              {loading ? <Spinner /> : authView === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#475569', marginTop: 24, fontSize: 14 }}>
            {authView === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: '#a78bfa', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {authView === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  /* ════════ MAIN APP ════════ */
  const uid = user?.id || user?.id_miembro || '—';
  const nombre = user?.nombre || user?.nombre_miembro || 'Miembro Urban';
  const email = user?.email || '—';
  const fechaRegistro = user?.fecha_registro ? formatDate(user.fecha_registro) : '—';
  const rol = (user as any)?.rol?.nombre_rol || (user as any)?.nombre_rol || 'Miembro';

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: 'system-ui,sans-serif' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .card:hover{border-color:rgba(124,58,237,0.5)!important;transform:translateY(-2px)}
        .card{transition:border-color .2s,transform .2s}
        input:focus{border-color:#7c3aed!important; box-shadow:0 0 0 3px rgba(124,58,237,0.15)}
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{ borderBottom: '1px solid #1e293b', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>UrbanGYM</h1>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['classes', 'bookings', 'profile'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                  background: activeTab === tab ? '#1e293b' : 'transparent',
                  color: activeTab === tab ? '#fff' : '#64748b',
                  transition: 'all 0.2s'
                }}>
                  {tab === 'classes' ? '🏋️ Clases' : tab === 'bookings' ? '📅 Mis Reservas' : '👤 Mi Perfil'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#64748b', fontSize: 14 }}>Hola, <b style={{ color: '#a78bfa' }}>{nombre}</b></span>
            <button onClick={logout} style={{ background: 'none', border: '1px solid #334155', borderRadius: 10, color: '#94a3b8', padding: '7px 16px', cursor: 'pointer', fontSize: 13, transition: 'all 0.2s' }}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', animation: 'fadeIn 0.3s ease' }}>

        {/* ═══ CLASSES TAB ═══ */}
        {activeTab === 'classes' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Reserva tu Clase</h2>
              <p style={{ color: '#64748b', marginTop: 8 }}>Selecciona una clase y elige tu horario.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
              {classes.length === 0 && <p style={{ color: '#475569' }}>Cargando clases…</p>}
              {classes.map(c => (
                <div key={c.idClase} className="card" style={{
                  background: '#0f172a', border: '1px solid #1e293b',
                  borderRadius: 20, padding: 24
                }}>
                  <div style={{ width: 48, height: 48, background: 'rgba(124,58,237,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>🏋️</div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{c.nombreClase}</h3>
                  <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Entrenador: {c.entrenador}</p>
                  {c.tipo && <p style={{ color: '#64748b', fontSize: 13 }}>Tipo: {c.tipo}</p>}
                  {c.horario && <p style={{ color: '#64748b', fontSize: 13 }}>Horario: {c.horario}</p>}
                  <p style={{ color: '#475569', fontSize: 12, marginBottom: 16 }}>Capacidad: {c.capacidad} personas</p>
                  <button
                    onClick={() => openBookingModal(c)}
                    style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg,#7c3aed,#db2777)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'opacity 0.2s' }}
                    onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Reservar Ahora
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ MY BOOKINGS TAB ═══ */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Mis Reservas</h2>
              <p style={{ color: '#64748b', marginTop: 8 }}>Historial de todas tus reservas activas.</p>
            </div>
            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
                <p style={{ fontSize: 18, fontWeight: 600 }}>Aún no tienes reservas</p>
                <p style={{ fontSize: 14 }}>Ve a la pestaña de Clases para hacer tu primera reserva.</p>
                <button onClick={() => setActiveTab('classes')} style={{ marginTop: 16, padding: '10px 24px', background: 'linear-gradient(135deg,#7c3aed,#db2777)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  Ver Clases
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {bookings.map(b => (
                  <div key={b.idReserva} className="card" style={{
                    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '20px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 44, height: 44, background: 'rgba(124,58,237,0.12)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏋️</div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{classNameForId(b.claseId)}</p>
                        <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>📆 {formatDate(b.fecha)}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        padding: '4px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                        background: `${statusColor(b.estado)}20`, color: statusColor(b.estado), border: `1px solid ${statusColor(b.estado)}40`
                      }}>
                        {b.estado.charAt(0).toUpperCase() + b.estado.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ PROFILE TAB ═══ */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: 560 }}>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Mi Perfil</h2>
              <p style={{ color: '#64748b', marginTop: 8 }}>Tus datos registrados en UrbanGYM.</p>
            </div>

            {/* Avatar card */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 20, padding: 28, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0 }}>👤</div>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{nombre}</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>{email}</p>
                <span style={{ display: 'inline-block', marginTop: 8, padding: '2px 12px', background: 'rgba(124,58,237,0.15)', borderRadius: 999, color: '#a78bfa', fontSize: 12, fontWeight: 600 }}>{rol}</span>
              </div>
            </div>

            {/* Info cards */}
            {!editing ? (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 20, padding: 28 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  {[
                    { icon: '🪪', label: 'ID de Miembro', value: uid },
                    { icon: '📛', label: 'Nombre', value: nombre },
                    { icon: '📧', label: 'Correo', value: email },
                    { icon: '📅', label: 'Miembro desde', value: fechaRegistro },
                    { icon: '🏅', label: 'Rol', value: rol },
                    { icon: '📋', label: 'Reservas activas', value: String(bookings.length) },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#0a1425', border: '1px solid #1e293b', borderRadius: 14, padding: '14px 18px' }}>
                      <p style={{ margin: 0, color: '#475569', fontSize: 12 }}>{item.icon} {item.label}</p>
                      <p style={{ margin: '6px 0 0', fontWeight: 600, fontSize: 14, wordBreak: 'break-all' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setEditing(true); setProfileMsg(null); }}
                  style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#7c3aed,#db2777)', border: 'none', borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  ✏️ Editar perfil
                </button>
              </div>
            ) : (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 20, padding: 28 }}>
                <h4 style={{ margin: '0 0 20px', color: '#a78bfa' }}>✏️ Editar datos</h4>
                <form onSubmit={handleProfileSave}>
                  <Field label="Nombre Completo" value={profileForm.nombre} onChange={v => setProfileForm({ ...profileForm, nombre: v })} required placeholder="Tu nombre" />
                  <Field label="Correo Electrónico" type="email" value={profileForm.email} onChange={v => setProfileForm({ ...profileForm, email: v })} required placeholder="tu@email.com" />

                  {/* ── Cambio de contraseña ── */}
                  <div style={{ margin: '20px 0 4px', borderTop: '1px solid #1e293b', paddingTop: 20 }}>
                    <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b' }}>🔑 Cambio de contraseña <span style={{ color: '#334155' }}>(opcional — dejar vacío para no cambiar)</span></p>
                    <Field label="Contraseña Actual" type="password" value={profileForm.currentPassword} onChange={v => setProfileForm({ ...profileForm, currentPassword: v })} placeholder="Tu contraseña actual" />
                    <Field label="Nueva Contraseña" type="password" value={profileForm.newPassword} onChange={v => setProfileForm({ ...profileForm, newPassword: v })} placeholder="Mínimo 6 caracteres" />
                    <Field
                      label="Confirmar Nueva Contraseña"
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={v => setProfileForm({ ...profileForm, confirmPassword: v })}
                      placeholder="Repite la nueva contraseña"
                    />
                    {/* Live match indicator */}
                    {profileForm.newPassword && profileForm.confirmPassword && (
                      <p style={{ fontSize: 12, marginTop: -10, marginBottom: 12, color: profileForm.newPassword === profileForm.confirmPassword ? '#22c55e' : '#ef4444' }}>
                        {profileForm.newPassword === profileForm.confirmPassword ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                      </p>
                    )}
                  </div>

                  {profileMsg && (
                    <div style={{ padding: '12px 16px', marginBottom: 16, borderRadius: 12, background: profileMsg.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${profileMsg.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: profileMsg.ok ? '#22c55e' : '#ef4444', fontSize: 14 }}>
                      {profileMsg.text}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" disabled={profileLoading} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#7c3aed,#db2777)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: profileLoading ? 'not-allowed' : 'pointer', opacity: profileLoading ? 0.7 : 1 }}>
                      {profileLoading ? <Spinner /> : 'Guardar Cambios'}
                    </button>
                    <button type="button" onClick={() => { setEditing(false); setProfileMsg(null); loadProfile(); }}
                      style={{ padding: '12px 20px', background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══ BOOKING MODAL ═══ */}
      {bookingTarget && (
        <Modal onClose={() => setBookingTarget(null)}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Confirmar Reserva</h3>
              <button onClick={() => setBookingTarget(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Completa los datos para reservar tu lugar.</p>
          </div>

          {/* Class summary */}
          <div style={{ background: '#1e293b', borderRadius: 14, padding: '16px 18px', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, background: 'rgba(124,58,237,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏋️</div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{bookingTarget.nombreClase}</p>
                <p style={{ margin: '3px 0 0', color: '#94a3b8', fontSize: 13 }}>👨‍🏫 {bookingTarget.entrenador} · 👥 Cap. {bookingTarget.capacidad}</p>
                {bookingTarget.horario && <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 12 }}>🕐 {bookingTarget.horario}</p>}
              </div>
            </div>
          </div>

          <form onSubmit={handleConfirmBooking}>
            {/* Read-only member name */}
            <Field label="Miembro" value={nombre} readOnly />

            {/* Date picker */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Fecha de Reserva</label>
              <input
                required
                type="date"
                value={bookingForm.fecha}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setBookingForm({ ...bookingForm, fecha: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }}
              />
            </div>

            {/* Notes (optional) */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Notas adicionales <span style={{ color: '#475569' }}>(opcional)</span></label>
              <textarea
                value={bookingForm.notas}
                onChange={e => setBookingForm({ ...bookingForm, notas: e.target.value })}
                placeholder="Ej: lesión en el hombro, necesito equipo especial..."
                rows={3}
                style={{ width: '100%', padding: '12px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" disabled={bookingLoading} style={{
                flex: 1, padding: '14px', background: 'linear-gradient(135deg,#7c3aed,#db2777)',
                border: 'none', borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: 15,
                cursor: bookingLoading ? 'not-allowed' : 'pointer', opacity: bookingLoading ? 0.7 : 1, transition: 'opacity 0.2s'
              }}>
                {bookingLoading ? <Spinner /> : '✅ Confirmar Reserva'}
              </button>
              <button type="button" onClick={() => setBookingTarget(null)} style={{
                padding: '14px 18px', background: '#1e293b', border: '1px solid #334155',
                borderRadius: 14, color: '#94a3b8', fontWeight: 700, cursor: 'pointer'
              }}>
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default App;
