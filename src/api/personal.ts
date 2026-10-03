import { api } from './client';

export interface PersonalAgente {
  codigoPersonalEmpresa: number;
  codigoAgente: number;
  codigoPersona: number;
  codigoTipoPersonalEmpresa: string;
  descripcionTipoPersonalEmpresa: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: string;
  fechaNacimiento: string;
  codigoUsuario: number;
}

export interface TipoPersonalEmpresa {
  codigo: string;
  descripcion: string;
}

export interface PersonalDetalle {
  codigoAgente: number;
  codigoPersona: number;
  codigoTipoPersonalEmpresa: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: string;
  fechaNacimiento: string;
  correo: string;
  celular: string;
  codigoCorreo: number;
  codigoCelular: number;
  indicadorComisiones: string;
  codigoUsuario: number;
  tipoPersonalEmpresa: TipoPersonalEmpresa[];
}

export interface PersonalPayload {
  codigoPersonalEmpresa: number;
  codigoTipoPersonalEmpresa: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: string;
  fechaNacimiento: string;
  indicadorComisiones: string;
  codigoCorreo: number;
  correo: string;
  codigoCelular: number;
  celular: string;
  codigoUsuario: number;
}

export interface PermisoPersonal {
  codigoOpcion: number;
  nombreOpcion: string;
  nivel: number;
  codigoUsuario: number;
  permisoVer: string;
  permisoEjecucion: string;
}

export interface CrearUsuarioPayload {
  codigoUsuario: number;
  codigoPersonalEmpresa: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreUsuario: string;
  direccionEmail: string;
  passwordTexto: string;
}

export const getPermisosPersonal = (codigoUsuario: number) =>
  api.get<PermisoPersonal[]>(`/agentes/personal/${codigoUsuario}/permisos`).then((r) => r.data);

export const actualizarPermiso = (codigoOpcion: number, codigoUsuario: number, tipoPermiso: '1' | '2') =>
  api.put('/agentes/personal/permisos', { codigoOpcion, codigoUsuario, tipoPermiso }).then((r) => r.data);

export const crearUsuarioPersonal = (payload: CrearUsuarioPayload) =>
  api.post<{ success: boolean; codigoUsuario: number; mensaje: string }>('/agentes/personal/usuario', payload).then((r) => r.data);

export const getPersonalAgente = () =>
  api.get<PersonalAgente[]>('/agentes/listar-personal-agente').then((r) => r.data);

export const getPersonalDetalle = (codigoPersonal: number) =>
  api.get<PersonalDetalle>(`/agentes/personal/${codigoPersonal}`).then((r) => r.data);

export const crearPersonal = (payload: PersonalPayload) =>
  api.post<{ success: boolean; mensaje: string }>('/agentes/crear-personal', payload).then((r) => r.data);

export const actualizarPersonal = (payload: PersonalPayload) =>
  api.put<{ success: boolean; mensaje: string }>('/agentes/actualizar-personal', payload).then((r) => r.data);
