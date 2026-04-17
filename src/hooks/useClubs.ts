import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub,
  type CreateClubInput,
  type UpdateClubInput
} from '@/lib/api/clubs';

const clubKeys = {
  all: ['clubs'] as const,
  detail: (id: string) => ['clubs', id] as const
};

export function useClubs() {
  return useQuery({
    queryKey: clubKeys.all,
    queryFn: getClubs
  });
}

export function useClub(id: string) {
  return useQuery({
    queryKey: clubKeys.detail(id),
    queryFn: () => getClub(id)
  });
}

export function useCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateClubInput) => createClub(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubKeys.all });
    }
  });
}

export function useUpdateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClubInput }) => updateClub(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.all });
      queryClient.invalidateQueries({ queryKey: clubKeys.detail(id) });
    }
  });
}

export function useDeleteClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClub(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.all });
      queryClient.removeQueries({ queryKey: clubKeys.detail(id) });
    }
  });
}
