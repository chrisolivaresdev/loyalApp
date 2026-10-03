import { getListaAgentes, getPerfilAgente, ListaAgentesResponse, PerfilAgente } from '@/api/agent';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@tanstack/react-query';

export function useListaAgentes(permisosOk = true) {
  const user = useAuthStore((s) => s.user);
  return useQuery<ListaAgentesResponse>({
    queryKey: ['lista-agentes'],
    queryFn: getListaAgentes,
    enabled: !!user && permisosOk,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePerfilAgente(codigoAgente: number | null, individual = true, permisosOk = true) {
  const user = useAuthStore((s) => s.user);
  return useQuery<PerfilAgente>({
    queryKey: ['perfil-agente', codigoAgente, individual],
    queryFn: () => getPerfilAgente(codigoAgente ?? 0, individual),
    enabled: !!user && !!codigoAgente && codigoAgente > 0 && permisosOk,
    staleTime: 1000 * 60 * 2,
  });
}
