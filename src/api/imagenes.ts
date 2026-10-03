import { api } from './client';

export interface Campana {
  nombre: string;
  carpeta: string;
  fotos: string[];
}

export const getCampanas = async (): Promise<Campana[]> => {
  const { data } = await api.get<Campana[]>('/imagenes/campanas');
  return data;
};

/** URL absoluta de una imagen de campaña (ruta relativa: "<carpeta>/<archivo>"). */
export const imagenUrl = (relPath: string): string =>
  `${api.defaults.baseURL}/imagenes/archivo?path=${encodeURIComponent(relPath)}`;
