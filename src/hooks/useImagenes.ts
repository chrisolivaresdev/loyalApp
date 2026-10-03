import { Campana, getCampanas } from '@/api/imagenes';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@tanstack/react-query';

export function useCampanas() {
  const user = useAuthStore((s) => s.user);
  return useQuery<Campana[]>({
    queryKey: ['campanas'],
    queryFn: getCampanas,
    enabled: !!user,
    staleTime: 1000 * 60 * 30,
  });
}
