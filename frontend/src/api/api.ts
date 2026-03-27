import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),
  getQR: () => api.get('/auth/qr-code'),
  validateQR: (token: string) => api.post('/auth/validate-qr', { token }),
};

export const membersApi = {
  getAll: () => api.get('/members'),
  getMe: () => api.get('/members/me'),
  getOne: (id: string) => api.get(`/members/${id}`),
  update: (id: string, data: object) => api.patch(`/members/${id}`, data),
};

export const classesApi = {
  getAll: () => api.get('/classes'),
};

export const schedulesApi = {
  getAll: () => api.get('/schedules'),
};

export const bookingsApi = {
  create: (schedule_id: string) => api.post('/bookings', { schedule_id }),
  getMy: () => api.get('/bookings/my'),
  cancel: (id: string) => api.delete(`/bookings/${id}`),
};

export const waitlistApi = {
  join: (schedule_id: string) => api.post('/waitlist', { schedule_id }),
  getMy: () => api.get('/waitlist/my'),
  leave: (id: string) => api.delete(`/waitlist/${id}`),
};

export const workoutsApi = {
  getAll: () => api.get('/workouts'),
  getByMember: (memberId: string) => api.get(`/workouts/member/${memberId}`),
  getStats: (memberId: string) => api.get(`/workouts/stats/${memberId}`),
};

export const gymsApi = {
  getAll: () => api.get('/gyms'),
  getOpen: () => api.get('/gyms/open'),
  getOne: (id: string) => api.get(`/gyms/${id}`),
  create: (data: object) => api.post('/gyms', data),
  update: (id: string, data: object) => api.patch(`/gyms/${id}`, data),
  remove: (id: string) => api.delete(`/gyms/${id}`),
};

export const equipmentApi = {
  getByGym: (gymId: string) => api.get(`/equipment/gym/${gymId}`),
  getAvailable: (gymId: string) => api.get(`/equipment/gym/${gymId}/available`),
  update: (id: string, data: object) => api.patch(`/equipment/${id}`, data),
  create: (data: object) => api.post('/equipment', data),
  remove: (id: string) => api.delete(`/equipment/${id}`),
};

export default api;
