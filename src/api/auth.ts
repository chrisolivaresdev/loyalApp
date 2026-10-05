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

// ---------------- Recuperar / cambiar contraseña ----------------

export interface SolicitarCambioResponse {
  resultado: number;
  message: string;
}

export const solicitarCambioPassword = (usuario: string, correo: string) =>
  api.post<SolicitarCambioResponse>('/auth/solicitar-cambio-password', { usuario, correo }).then((r) => r.data);

export interface ValidarSolicitudResponse {
  resultado: number;
  codigoUsuario: number | null;
}

export const validarSolicitudPassword = (idSolicitud: string) =>
  api.get<ValidarSolicitudResponse>('/auth/validar-solicitud-password', { params: { IDSolicitud: idSolicitud } }).then((r) => r.data);

export const cambiarPassword = (idSolicitud: string, password: string) =>
  api.post<{ message: string }>('/auth/cambiar-password', { idSolicitud, password }).then((r) => r.data);
