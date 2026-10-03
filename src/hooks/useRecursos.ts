import { getRecursos, RecursoCategoria } from '@/api/recursos';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@tanstack/react-query';

export function useRecursos(permisosOk = true) {
  const user = useAuthStore((s) => s.user);
  return useQuery<RecursoCategoria[]>({
    queryKey: ['recursos'],
    queryFn: getRecursos,
    enabled: !!user && permisosOk,
    staleTime: 1000 * 60 * 30,
  });
}
