# Inventario Loyal App — Web vs Mobile

Estado: **paridad funcional con el portal legado ASP.NET**. Backend: `loyal-be` (NestJS, puerto 3000). Stack: Expo SDK 57, React Native Web, Expo Router, Paper, React Query, Axios.

## 1. Pantallas y flujos

| Ruta | Función | Web | Mobile |
|---|---|---|---|
| `/login` | Login JWT (cookie), link recuperación | ✅ | ✅ |
| `/recuperar` | Solicita link de reseteo por correo (SES) | ✅ | ✅ |
| `/cambiar-password` | Nueva contraseña con token del link | ✅ | ✅ |
| `/dashboard` | KPIs, gráficos, resúmenes, estructura agente | ✅ | ✅ |
| `/cotizaciones` | Listado + filtros + Excel/PDF export | ✅ | ✅ |
| `/cotizaciones/nueva` | Crear cotización (formulario completo) | ✅ | ✅ |
| `/cotizaciones/[id]` | Detalle, primas, PDF, enviar correo, **aprobar → solicitud** | ✅ | ✅ |
| `/solicitudes` | Listado + exports Excel/PDF | ✅ | ✅ |
| `/solicitudes/[id]` | Detalle ConsultaSolicitud, docs pendientes, upload, vacunado/mayor edad | ✅ | ✅ |
| `/polizas` | Listado + exports | ✅ | ✅ |
| `/polizas/[id]` | Detalle completo + notas + SMS + pago línea + upload + **editar asegurado** + docs generados | ✅ | ✅ |
| `/agentes` | Listado de agentes | ✅ | ✅ |
| `/agentes/[id]` | Perfil, jerarquía, cartera, comisiones | ✅ | ✅ |
| `/personal` | CRUD personal, usuarios, permisos | ✅ | ✅ |
| `/comisiones` | Comisiones del agente | ✅ | ✅ |
| `/recursos` | Documentos del agente + **constancia PDF** | ✅ | ✅ |
| `/campanas` | Galería fotos + **Campaña Express** | ✅ | ✅ |
| `/perfil` | Datos del usuario + **foto de perfil desde archivo** (BLOB en BD) | ✅ | ✅ |
| `/correo` | Envío de correo genérico (Para/CC/Asunto/Cuerpo) | ✅ | ✅ |

## 2. Endpoints conectados

| Endpoint | Uso |
|---|---|
| `POST /auth/login` · `refresh` · `logout` | Sesión |
| `POST /auth/solicitar-cambio-password` · `GET /auth/validar-solicitud-password` · `POST /auth/cambiar-password` | Recuperación |
| `GET /agentes/dashboard` · `grafico-*` · `permisos` · `:id/perfil` · `estructura` | Dashboard/permisos/perfil |
| `GET /agentes/campana-express` | Campaña Express (VW_MO_Campana) |
| `GET /agentes/constancia` | PDF constancia (pdf-lib) |
| `GET/PUT /agentes/perfil/imagen` | Foto de perfil en `Usuario.UsuarioImagen` (base64, máx 2MB) |
| `GET/POST /agentes/personal*` · `PUT /agentes/personal/permisos` | Personal + permisos |
| `GET /cotizaciones` · `:id` · `resumen` · `paises` · `planes` · `reporte/*` | Cotizaciones |
| `POST /cotizaciones/solicitar-cotizacion` · `enviar-cotizacion` · `aprobar-cotizacion` | Crear, correo, aprobar (ejec) |
| `GET /solicitudes` · `:id` · `reporte/*` · `listado-estado/:e` | Solicitudes |
| `POST /solicitudes/:id/documentos` · `personas/:p/documentos|vacunado|mayor-edad` | Docs/personas solicitud |
| `GET /certificados/:id` · `tipos-documento` · `tipos-persona` | Detalle póliza |
| `GET/PUT /certificados/:id/asegurados/:p` | Ver/editar asegurado (ejec) |
| `POST /certificados/:id/notas` · `sms` · `pago-linea` · `documentos` | Acciones póliza (ejec) |
| `GET /certificados/:id/documento` | coverage/cards/policy/recibo (upstream) |
| `GET /documentos/descargar/:id` | Descarga docs |
| `GET /recursos` · `recursos/archivo` | Recursos |
| `GET /imagenes/campanas` · `imagenes/archivo` | Galería |
| `POST /correo/enviar` | Correo genérico SES |

## 3. Pruebas ejecutadas

- **Builds**: `npm run build` backend ✅ · `npx tsc --noEmit` frontend ✅
- **Endpoints en vivo (usuario rsalinas)**: login, permisos, planes×4, campana-express (4 pólizas), constancia (PDF 366KB), tipos-persona, asegurado GET, correo (401/400), PUT asegurado (401)
- **Recuperación de clave**: rutas OK (usuario falso → resultado 1, token falso → 400)

## 4. Diferencias Web vs Mobile

| Área | Web | Mobile |
|---|---|---|
| Navegación | Sidebar fijo | Drawer / stack |
| Descargas | `window.open` + cookie automática | `FileSystem.downloadAsync` + `Sharing` |
| Upload | File input | `expo-document-picker` |
| Fechas | `<input type=date>` | `@react-native-community/datetimepicker` |
| Favicon/app icon | Logo Loyal (tesela azul) | `icon.png`/`splash-icon.png` Loyal |

## 5. Funciones incompletas / bloqueos

1. **Descargas protegidas en nativo** — `downloadAsync` puede no enviar la cookie JWT (pendiente validar en dispositivo/emulador real).
2. **`POST /cotizaciones/aprobar-cotizacion`** — endpoint verificado, pero no se disparó end-to-end (crea solicitud real).
3. **`PUT asegurado`** — validado en ruta/permiso; no se ejecutó con datos reales (escribe en BD).
4. **SMS (Twilio)** — código listo, falta configurar credenciales en ambiente.
5. **PDFs upstream** — requieren `LOYAL_UPSTREAM_TOKEN` válido.
6. **Envío real de correo** — SES configurado vía env; envío real no verificado contra destinatario válido.
7. **`APP_WEB_URL`** — setear URL pública para links de recuperación en producción.

## 6. Comportamiento por permisos

- `ver`/`ejec` filtran menú, pantallas (redirect si no hay ver), botones (notas/pago/upload/SMS/aprobar/editar asegurado) y endpoints (401/403 backend).
