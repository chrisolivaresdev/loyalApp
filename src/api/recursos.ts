import { api } from './client';

export interface RecursoDocumento {
  nombre: string;
  /** Ruta relativa dentro del servidor (archivos locales). */
  archivo?: string;
  /** URL externa completa. */
  url?: string;
}

export interface RecursoCategoria {
  nombre: string;
  documentos?: RecursoDocumento[];
  subcategorias?: RecursoCategoria[];
}

export const getRecursos = async (): Promise<RecursoCategoria[]> => {
  const { data } = await api.get<RecursoCategoria[]>('/recursos');
  return data;
};

/** URL absoluta para abrir/descargar un archivo local del backend. */
export const archivoRecursoUrl = (archivo: string): string =>
  `${api.defaults.baseURL}/recursos/archivo?path=${encodeURIComponent(archivo)}`;
