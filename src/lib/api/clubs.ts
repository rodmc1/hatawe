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
  role: 'admin' | 'member' | null;
}

export interface CreateClubInput {
  name: string;
  description?: string;
  courtIds?: string[];
  logo?: File;
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
  const formData = new FormData();
  formData.append('name', input.name);
  if (input.description) formData.append('description', input.description);
  if (input.courtIds?.length) formData.append('courtIds', JSON.stringify(input.courtIds));
  if (input.logo) formData.append('logo', input.logo);

  const { data } = await api.post<Club>('/clubs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function updateClub(id: string, input: UpdateClubInput) {
  const { data } = await api.patch<Club>(`/clubs/${id}`, input);
  return data;
}

export async function deleteClub(id: string) {
  await api.delete(`/clubs/${id}`);
}
