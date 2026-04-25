import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPlayer, getPlayers, type CreatePlayerPayload } from '@/lib/api/players';

const playerKeys = {
  byClub: (clubId: string) => ['players', clubId] as const
};

export function usePlayers(clubId: string) {
  return useQuery({
    queryKey: playerKeys.byClub(clubId),
    queryFn: () => getPlayers(clubId),
    enabled: !!clubId
  });
}

export function useAddPlayer(clubId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreatePlayerPayload, 'clubId'>) => createPlayer({ ...payload, clubId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.byClub(clubId) });
      onSuccess?.();
    }
  });
}
