import api from './axios';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: string;
  membershipStatus: string;
  joinedAt: string;
}

export async function getPlayers(clubId: string) {
  const { data } = await api.get<Player[]>('/players', { params: { clubId } });
  return data;
}
