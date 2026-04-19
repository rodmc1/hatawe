import api from './axios';

export interface Court {
  id: string;
  name: string;
  location: string;
  status: 'available' | 'occupied' | 'maintenance';
}

export async function getCourts() {
  const { data } = await api.get<Court[]>('/courts');
  return data;
}
