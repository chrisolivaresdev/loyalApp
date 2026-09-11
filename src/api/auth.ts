import { api } from './client';

export interface User {
  CodigoUsuario: number;
  NombreCompletoUsuario: string;
  NombrePagina: string;
  CodigoPerfil: number;
  NombrePerfil: string;
  UsuarioImagen: string;
  DireccionEmail: string;
  IndicadorCorreoVerificado: boolean;
  IndicadorCambioPassword: boolean;
  IndicadorVistaAgentes: boolean;
  CodigoEstadoUsuario: number;
  CodigoPersonalInterno?: number;
  CodigoAgente?: number;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export const login = (dto: LoginDto) =>
  api.post<LoginResponse>('/auth/login', dto).then((r) => r.data);

export const logout = () => api.post('/auth/logout').then((r) => r.data);

export interface RefreshResponse {
  message: string;
  user: User;
}

export const refresh = () =>
  api.post<RefreshResponse>('/auth/refresh').then((r) => r.data);
