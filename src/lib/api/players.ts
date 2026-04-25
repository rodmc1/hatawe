import api from './axios';
import { type PlayerLevel } from '@/lib/types/player';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: string;
  membershipStatus: string;
  joinedAt: string;
}

export interface CreatePlayerPayload {
  clubId: string;
  name: string;
  email: string;
  level: PlayerLevel;
  membershipDate?: Date;
}

export async function getPlayers(clubId: string) {
  const { data } = await api.get<Player[]>('/players', { params: { clubId } });
  return data;
}

export async function createPlayer(payload: CreatePlayerPayload) {
  const { data } = await api.post<{ success: boolean }>('/players', {
    ...payload,
    membershipDate: payload.membershipDate?.toISOString()
  });
  return data;
}
