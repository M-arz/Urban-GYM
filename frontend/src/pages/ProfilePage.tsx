import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { membersApi, authApi } from '../api/api';
import { User, Mail, Phone, CreditCard, RefreshCw, Loader2, CheckCircle, QrCode } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrExpires, setQrExpires] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);

  useEffect(() => {
    membersApi.getMe().then(({ data }) => {
      setMemberData(data);
      setForm({ name: data.name, phone: data.phone || '' });
    }).catch(() => {});
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      await membersApi.update(user.id, { name: form.name, phone: form.phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateQR = async () => {
    setLoadingQr(true);
    try {
      const { data } = await authApi.getQR();
      setQrCode(data.qrCode);
      setQrToken(data.qrToken);
      setQrExpires(data.expiresAt);
    } catch {
      alert('Error al generar el código QR');
    } finally {
      setLoadingQr(false);
    }
  };

  const timeUntilExpiry = () => {
    if (!qrExpires) return '';
    const diff = new Date(qrExpires).getTime() - Date.now();
    if (diff <= 0) return 'Expirado';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
        <p className="text-gray-500 mt-1">Gestiona tu información personal y acceso al gimnasio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información personal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User size={18} className="text-indigo-500" />
            Información Personal
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Mail size={13} /> Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Phone size={13} /> Teléfono
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="3001234567"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saved ? <><CheckCircle size={15} /> Guardado</> : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Suscripción */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-indigo-500" />
              Suscripción
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan actual</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {memberData?.subscription_plan || 'Básico'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estado</span>
                <span className={`font-semibold ${memberData?.subscription_status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                  {memberData?.subscription_status === 'active' ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rol</span>
                <span className="font-semibold text-gray-800 capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Miembro desde</span>
                <span className="font-semibold text-gray-800">
                  {memberData?.created_at
                    ? new Date(memberData.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* QR de acceso */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <QrCode size={18} className="text-indigo-500" />
              Código QR de Acceso
            </h2>
            <p className="text-xs text-gray-400 mb-4">Válido por 5 minutos. Muéstralo en recepción para acceder.</p>

            {qrCode ? (
              <div className="flex flex-col items-center gap-3">
                <img src={qrCode} alt="QR de acceso" className="w-48 h-48 rounded-lg border border-gray-100" />
                <p className="text-xs text-gray-500">Expira en: <span className="font-semibold text-indigo-600">{timeUntilExpiry()}</span></p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(qrToken || '');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  {copied ? '✓ Token copiado' : 'Copiar Token para Validador'}
                </button>
                <button
                  onClick={handleGenerateQR}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <RefreshCw size={14} /> Renovar QR
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateQR}
                disabled={loadingQr}
                className="w-full py-2.5 border-2 border-dashed border-indigo-300 hover:border-indigo-500 text-indigo-600 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loadingQr ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
                {loadingQr ? 'Generando...' : 'Generar QR de Acceso'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
