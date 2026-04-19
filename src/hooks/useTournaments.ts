import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTournaments, createTournament, type CreateTournamentInput } from '@/lib/api/tournaments';

const tournamentKeys = {
  all: ['tournaments'] as const
};

export function useTournaments() {
  return useQuery({
    queryKey: tournamentKeys.all,
    queryFn: getTournaments
  });
}

export function useCreateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTournamentInput) => createTournament(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
    }
  });
}
