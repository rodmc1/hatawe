import { useQuery } from '@tanstack/react-query';
import { getPlayers } from '@/lib/api/players';

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
