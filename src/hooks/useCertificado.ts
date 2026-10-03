import { getCertificadoDetalle } from '@/api/certificados';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@tanstack/react-query';

export function useCertificadoDetalle(codigoCertificado?: number, permisosOk = true) {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['certificado', codigoCertificado],
    queryFn: () => getCertificadoDetalle(codigoCertificado!),
    enabled: !!user && !!codigoCertificado && permisosOk,
  });
}
