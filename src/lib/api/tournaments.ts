import api from './axios';

export type TournamentStatus = 'open' | 'full' | 'ongoing' | 'closed';

export interface Tournament {
  id: string;
  name: string;
  poster_url?: string;
  club_id: string;
  club_name: string;
  tournament_date: string;
  status: TournamentStatus;
  max_participants: number;
  registered_count: number;
}

export interface CreateTournamentInput {
  name: string;
  club_id: string;
  tournament_date: string;
  max_participants: number;
  poster?: File;
}

export async function getTournaments() {
  const { data } = await api.get<Tournament[]>('/tournaments');
  return data;
}

export async function createTournament(input: CreateTournamentInput) {
  const formData = new FormData();
  formData.append('name', input.name);
  formData.append('club_id', input.club_id);
  formData.append('tournament_date', input.tournament_date);
  formData.append('max_participants', String(input.max_participants));
  if (input.poster) formData.append('poster', input.poster);

  const { data } = await api.post<Tournament>('/tournaments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}
