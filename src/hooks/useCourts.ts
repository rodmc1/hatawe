import { useQuery } from '@tanstack/react-query';
import { getCourts } from '@/lib/api/courts';

const courtKeys = {
  all: ['courts'] as const
};

export function useCourts() {
  return useQuery({
    queryKey: courtKeys.all,
    queryFn: getCourts
  });
}
