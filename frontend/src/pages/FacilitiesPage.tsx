import { useEffect, useState } from 'react';
import { gymsApi, equipmentApi } from '../api/api';
import { Building2, Dumbbell, Clock, Users, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

interface Gym {
  id: string;
  name: string;
  address: string;
  capacity: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: 'available' | 'maintenance' | 'out_of_service';
}

export default function FacilitiesPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selected, setSelected] = useState<Gym | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEquip, setLoadingEquip] = useState(false);

  useEffect(() => {
    gymsApi.getAll()
      .then(({ data }) => setGyms(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelectGym = async (gym: Gym) => {
    setSelected(gym);
    setLoadingEquip(true);
    try {
      const { data } = await equipmentApi.getByGym(gym.id);
      setEquipment(data);
    } catch {
      setEquipment([]);
    } finally {
      setLoadingEquip(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'available') return 'bg-green-100 text-green-700';
    if (status === 'maintenance') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-600';
  };

  const statusLabel = (status: string) => {
    if (status === 'available') return 'Disponible';
    if (status === 'maintenance') return 'Mantenimiento';
    return 'Fuera de servicio';
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Instalaciones</h1>
        <p className="text-gray-500 mt-1">Consulta las sedes abiertas y el equipamiento disponible.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista de sedes */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <Building2 size={17} className="text-indigo-500" /> Sedes
          </h2>
          {loading ? (
            <p className="text-sm text-gray-400">Cargando sedes...</p>
          ) : gyms.length === 0 ? (
            <p className="text-sm text-gray-400">No hay sedes registradas.</p>
          ) : (
            gyms.map((gym) => (
              <button
                key={gym.id}
                onClick={() => handleSelectGym(gym)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected?.id === gym.id
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-gray-100 bg-white hover:border-indigo-200'
                } shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{gym.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{gym.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {gym.is_open ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle size={11} /> Abierto
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        <XCircle size={11} /> Cerrado
                      </span>
                    )}
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {gym.open_time?.slice(0, 5)} – {gym.close_time?.slice(0, 5)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={11} /> Cap. {gym.capacity}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Equipamiento de la sede seleccionada */}
        <div>
          <h2 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <Dumbbell size={17} className="text-indigo-500" />
            {selected ? `Equipamiento — ${selected.name}` : 'Selecciona una sede'}
          </h2>

          {!selected ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
              <Dumbbell size={36} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Haz clic en una sede para ver su equipamiento</p>
            </div>
          ) : loadingEquip ? (
            <p className="text-sm text-gray-400">Cargando equipamiento...</p>
          ) : equipment.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-sm text-gray-400">Sin equipamiento registrado.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">Equipo</th>
                    <th className="px-4 py-2 text-left">Categoría</th>
                    <th className="px-4 py-2 text-center">Cant.</th>
                    <th className="px-4 py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {equipment.map((eq) => (
                    <tr key={eq.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-800">{eq.name}</td>
                      <td className="px-4 py-2 text-gray-500 capitalize">{eq.category}</td>
                      <td className="px-4 py-2 text-center text-gray-700">{eq.quantity}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(eq.status)}`}>
                          {statusLabel(eq.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
