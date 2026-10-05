import { api } from './client';

export interface EnviarCorreoRequest {
  para: string;
  copia?: string;
  asunto: string;
  cuerpo: string;
}

export interface EnviarCorreoResponse {
  enviado: boolean;
  message: string;
}

export const enviarCorreo = (dto: EnviarCorreoRequest) =>
  api.post<EnviarCorreoResponse>('/correo/enviar', dto).then((r) => r.data);
