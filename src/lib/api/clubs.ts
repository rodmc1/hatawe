import api from './axios';

export interface ClubMember {
  id: string;
  name: string;
  avatar?: string;
}

export interface Club {
  id: string;
  name: string;
  logo?: string;
  memberCount: number;
  members: ClubMember[];
  role: 'owner' | 'admin' | 'member';
}

export interface CreateClubInput {
  name: string;
}

export interface UpdateClubInput {
  name?: string;
}

export async function getClubs() {
  const { data } = await api.get<Club[]>('/clubs');
  return data;
}

export async function getClub(id: string) {
  const { data } = await api.get<Club>(`/clubs/${id}`);
  return data;
}

export async function createClub(input: CreateClubInput) {
  const { data } = await api.post<Club>('/clubs', input);
  return data;
}

export async function updateClub(id: string, input: UpdateClubInput) {
  const { data } = await api.patch<Club>(`/clubs/${id}`, input);
  return data;
}

export async function deleteClub(id: string) {
  await api.delete(`/clubs/${id}`);
}
