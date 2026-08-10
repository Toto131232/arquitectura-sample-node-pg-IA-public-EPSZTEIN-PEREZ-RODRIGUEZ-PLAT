# 📓 Bitácora de Prompts — Ejercicio N° 05

> Basada en `prompting/PLANTILLA - Bitacora de prompts y entrega.md`

---

## Datos

- **Alumno/a:** [YO] Completar
- **Ejercicio:** N° 05 — Middleware de Autenticación con JWT
- **Fecha:** [YO] Completar
- **Modelo de IA usado:** Cursor (Composer)

---

## 1. 🎯 Qué me pidieron

Agregar autenticación JWT al proyecto existente para que las operaciones de escritura (POST, PUT, DELETE) no sean públicas. Implementar `POST /api/auth/login`, middleware `authMiddleware`, uso de `process.env.JWT_SECRET`, expiración del token, `jwt.verify()` (no `decode`), manejo 401, y bitácora del proceso.

```
El objetivo es evitar que cualquier cliente pueda hacer DELETE /api/alumnos/3
sin autenticarse, respetando la arquitectura controller → service → repository.
```

---

## 2. 💬 Mis prompts (en orden)

### Prompt #1 — Auditoría y diseño (sin código)

**Lo que escribí:**
```
Actuá como desarrollador backend senior... Ejercicio 05...
Antes de implementar: analizá databasecompleta.sql, src/, proponé diseño.
NO implementes todavía.
```

**Auto-chequeo EFSI:**
- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteración

**Qué me devolvió (resumen):**
```
Diagnóstico: sin tabla usuarios en BD, sin middlewares, sin jsonwebtoken.
Propuesta: credenciales en .env, authMiddleware en POST/PUT/DELETE,
GET públicos, AppError.unauthorized, .env en .gitignore.
```

**¿Me sirvió tal cual?**
```
Sí, como base de diseño aprobada antes de implementar.
```

### Prompt #2 — Implementación completa

**Lo que escribí:**
```
Implementá el Ejercicio 05 sobre el proyecto analizado...
[incluye pruebas obligatorias, bitácora, restricciones de seguridad,
marcado [IA], no hacer commit automático]
```

**Por qué este segundo prompt:**
```
El prompt anterior fue solo diseño; este pidió la implementación,
verificación y documentación.
```

**Qué me devolvió (resumen):**
```
Implementación de auth-controller, auth-service, authMiddleware,
protección de controllers, actualización de .env-template y .gitignore,
pruebas ejecutadas con script scripts/test-ej05-auth.mjs.
```

---

## 3. 🔧 Qué hizo la IA y qué hice yo

| Archivo / función | Lo generó la IA | Lo modifiqué/escribí yo | Por qué |
|---|---|---|---|
| `src/middlewares/authMiddleware.js` | Sí | Pendiente revisión | `jwt.verify`, 401 por caso |
| `src/services/auth-service.js` | Sí | Pendiente revisión | Login + firma JWT |
| `src/controllers/auth-controller.js` | Sí | Pendiente revisión | POST /login |
| `src/helpers/app-error.js` → `unauthorized()` | Sí | Pendiente revisión | 401 consistente |
| `src/server.js` | Sí | Pendiente revisión | Montar `/api/auth` |
| Controllers (alumnos, cursos, materias, calificaciones) | Sí | Pendiente revisión | `authMiddleware` en escritura |
| `.env-template` | Sí | Pendiente revisión | Variables JWT |
| `.gitignore` | Sí | Pendiente revisión | Ignorar `.env` |
| `package.json` | Sí (npm install) | Pendiente revisión | `jsonwebtoken` |
| `scripts/test-ej05-auth.mjs` | Sí | Opcional | Verificación automatizada |
| `prompting/bitacoras/05-bitacora.md` | Sí (estructura) | [YO] Completar datos y reflexión final |

---

## 4. 🐛 Errores o cosas mal que detecté en la respuesta de la IA

```
1. .gitignore original NO incluía .env — corregido agregando .env (Ej. 09 también lo pide).

2. databasecompleta.sql no tiene tabla usuarios — se usó login educativo con AUTH_USERNAME/
   AUTH_PASSWORD en .env (decisión documentada, no inventar tabla).

3. GET /api/alumnos/test-insert crea datos pero es GET — se protegió con authMiddleware
   porque es una operación de escritura disfrazada.

4. Durante pruebas, GET /api/alumnos y DELETE autenticado devolvieron 500 por error de
   conexión a Supabase — NO es fallo del middleware; el auth pasó (status ≠ 401).
   [YO] Verificar DB_TARGET y credenciales locales antes de demo final.

5. No se detectó en esta implementación: secreto hardcodeado ni uso de jwt.decode().
   Verificación con grep en src/ → sin coincidencias.
```

---

## 5. ✅ Verificación

### Pruebas ejecutadas (script `node scripts/test-ej05-auth.mjs`)

Servidor en ejecución con `npm run server` (watch). Resultados:

| Caso | Descripción | Resultado |
|---|---|---|
| 1 | POST /api/auth/login credenciales correctas | **PASS** — HTTP 200 + `{ token }` |
| 2 | POST /api/auth/login credenciales incorrectas | **PASS** — HTTP 401 |
| 3 | DELETE /api/alumnos/3 sin Authorization | **PASS** — HTTP 401 |
| 4 | DELETE con Authorization mal formado | **PASS** — HTTP 401 |
| 5 | DELETE con JWT inválido | **PASS** — HTTP 401 |
| 6 | DELETE con JWT vencido | **PASS** — HTTP 401, msg "Token expirado." |
| 7 | DELETE con JWT válido | **PASS** — HTTP 500 (error BD; middleware dejó pasar, ≠ 401) |
| 8 | JWT modificado manualmente | **PASS** — HTTP 401 |
| 9 | POST y PUT sin token | **PASS** — HTTP 401 en ambos |
| 10 | GET /api/alumnos sin token | **PASS** — HTTP 500 (BD); **no** 401 → sigue público |
| 11 | Secreto hardcodeado en .js | **PASS** — grep sin matches en `src/` |
| 12 | `.env` en `.gitignore` | **PASS** — línea `.env` presente |

**Total: 11/11 casos de auth PASS.** Casos 7 y 10 muestran 500 por BD (Supabase), no por JWT.

### Checklist consigna

```
- [x] Login devuelve token / credenciales incorrectas → 401
- [x] DELETE sin header → 401
- [x] Token inválido/vencido → 401
- [x] Token válido atraviesa middleware
- [x] JWT_SECRET solo en process.env
- [x] jwt.verify en middleware (no decode)
- [x] .env en .gitignore
- [ ] [YO] Capturas Postman para entrega
- [ ] [YO] Commit en GitHub
```

---

## 6. ✍️ Reflexión (300–600 palabras)

[YO] Completar con tus palabras. Borrador base:

**¿Qué cosas de seguridad dio mal o "de ejemplo" la IA y qué tuve que corregir?**

En esta implementación la IA siguió las restricciones del prompt (no hardcodear secreto, usar verify).
Lo que corregí/verifiqué manualmente fue: (1) agregar `.env` al `.gitignore` porque el proyecto
original no lo tenía; (2) confirmar con grep que no exista `jwt.decode` ni secretos en `src/`;
(3) documentar que el login con usuario/clave en `.env` es simplificación educativa.

**¿Por qué jwt.verify() y no jwt.decode()?**
`decode()` solo lee el payload en base64 sin validar la firma. Cualquiera podría fabricar un token.
`verify()` comprueba firma y expiración con `JWT_SECRET`.

**¿Por qué el JWT no está encriptado?**
Está firmado y codificado (base64url), no cifrado. El payload es legible; por eso solo lleva `{ sub: username }`.

**¿Qué pasa si modificamos una parte del token?**
La firma deja de coincidir → `jwt.verify()` lanza error → 401. Verificado en CASO 8.

**¿Por qué el secreto no debe estar hardcodeado?**
Porque el código suele commitearse; quien tenga el secreto puede falsificar tokens válidos.

**¿Por qué .env no debe commitearse?**
Contiene JWT_SECRET, passwords de BD y credenciales de login.

**¿Qué cambiaría en producción?**
Tabla de usuarios, passwords con bcrypt, refresh tokens, HTTPS, CORS restringido, rotación de secretos,
rate limiting en login, y no comparar contraseñas en texto plano contra variables de entorno.

---

## 7. Decisiones de diseño registradas

| Tema | Decisión |
|---|---|
| Credenciales | `.env`: `AUTH_USERNAME`, `AUTH_PASSWORD` — no hay usuarios en BD |
| GET | Públicos (listados y por id) |
| Escritura | POST, PUT, DELETE protegidos en 4 entidades + test-insert |
| Payload JWT | Solo `{ sub: username }` |
| Expiración | `JWT_EXPIRES_IN` (default `1h`) |
| Errores 401 | Mensajes distintos: sin token, formato, inválido, expirado |
| BD | **Sin cambios** en `databasecompleta.sql` |

---

## 8. 🔗 Adjuntos

- [ ] Link/PDF conversación completa con la IA
- [ ] Commit(s) en GitHub: `[YO] Completar`
- [ ] Capturas Postman (login, DELETE sin token, DELETE con token)
