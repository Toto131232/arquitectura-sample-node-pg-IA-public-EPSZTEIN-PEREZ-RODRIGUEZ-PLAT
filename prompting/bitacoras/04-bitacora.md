# 📓 Bitácora de Prompts — Ejercicio N° 04

> Copiá este archivo por cada ejercicio que entregues. Nombralo, por ejemplo, `entregas/01-bitacora.md`.
> Esta bitácora **es parte de la nota**. Un ejercicio sin bitácora no se corrige.

---

## Datos

- **Alumno/a:** [YO] Completar
- **Ejercicio:** N° 04 — Validaciones y códigos de error
- **Fecha:** [YO] Completar
- **Modelo de IA usado:** Cursor (Composer)

---

## 1. 🎯 Qué me pidieron

Unificar las validaciones de input y los códigos HTTP de error en la API REST del proyecto, sin cambiar la arquitectura en capas ni agregar librerías de validación externas. El foco principal estaba en alumnos (body vacío, IDs inconsistentes, defaults silenciosos en el repository) y en calificaciones (nota, FKs, duplicados con 409).

```
Implementar validación antes del repository, crear parsearId reutilizable,
unificar 400/404/409/500, no filtrar errores crudos de PostgreSQL,
y mantener validarCursoExiste como patrón de referencia.
```

---

## 2. 💬 Mis prompts (en orden)

### Prompt #1

**Lo que escribí:**
```
Actuá como desarrollador backend Node.js/Express y auditor de código...
[Auditoría completa del ejercicio 04 — sin escribir código todavía]
```

**Auto-chequeo de las 5 partes EFSI** (marcá lo que incluiste):
- [x] Rol
- [x] Contexto (¿pegaste código del proyecto?)
- [x] Tarea
- [x] Restricciones
- [x] Iteración

**Qué me devolvió (resumen):**
```
Auditoría detallada por endpoint, problemas encontrados (DbPg traga errores,
?? '' en repos, IDs inconsistentes), propuesta de arquitectura con helpers
+ AppError + validación en service, y lista de archivos a modificar.
```

**¿Me sirvió tal cual, o tuve que corregir/repreguntar?**
```
Sirvió como base de diseño. No se implementó código en esa iteración.
```

### Prompt #2

**Lo que escribí:**
```
Ahora implementá las validaciones siguiendo el análisis anterior...
[Requisitos detallados de implementación]
```

**Por qué necesité este segundo prompt** (qué falló o faltó en el anterior):
```
El primer prompt pedía explícitamente NO escribir código — solo auditoría y propuesta.
```

**Qué me devolvió (resumen):**
```
Inicio de implementación (helpers parciales) pero la sesión no completó todos los archivos.
```

### Prompt #3

**Lo que escribí:**
```
Actuá como un desarrollador backend senior especializado en Node.js, Express y PostgreSQL,
pero teniendo en cuenta que este es un trabajo práctico educativo de ORT sobre prompting con IA...
[Especificación completa del Ejercicio 04 con restricciones, marcado [IA]/[YO], bitácora obligatoria,
verificación Postman, y proceso diagnóstico → implementación → resumen]
```

**Por qué necesité este tercer prompt:**
```
Consolidar la implementación completa, crear la bitácora según plantilla del TP,
aplicar marcado [IA]/[YO], y adaptar al estado real del proyecto (archivos faltantes).
```

**Qué me devolvió (resumen):**
```
Diagnóstico del estado real + implementación completa de validaciones, CRUD de
materias/calificaciones faltantes, y esta bitácora.
```

---

## 3. 🔧 Qué hizo la IA y qué hice yo

Marcá esto **también en el código** con comentarios `// [IA]` y `// [YO]`. Acá resumilo:

| Archivo / función | Lo generó la IA | Lo modifiqué/escribí yo | Por qué |
|---|---|---|---|
| `src/helpers/app-error.js` | Sí | Pendiente revisión | Clase de error con statusCode |
| `src/helpers/validaciones-helper.js` | Sí | Pendiente revisión | `parsearId` y validadores de campos |
| `src/helpers/respuestas-helper.js` | Sí | Pendiente revisión | Manejo de `AppError` sin exponer PG |
| `src/repositories/db-pg.js` → `mapPgError` | Sí | Pendiente revisión | Mapper de códigos PG a HTTP |
| `src/services/alumnos-service.js` | Sí | Pendiente revisión | Validación input + `validarCursoExiste` → 404 |
| `src/services/cursos-service.js` | Sí | Pendiente revisión | Validación de `nombre` |
| `src/services/materias-service.js` | Sí | Pendiente revisión | Nuevo — faltaba en el proyecto |
| `src/services/calificaciones-service.js` | Sí | Pendiente revisión | Nuevo — validaciones de negocio |
| `src/repositories/*` | Sí | Pendiente revisión | Quitados `?? ''` / `?? 0` silenciosos |
| `src/controllers/*` | Sí | Pendiente revisión | Uso uniforme de `parsearId` |
| `src/server.js` | Sí | Pendiente revisión | Rutas materias y calificaciones |
| `prompting/bitacoras/04-bitacora.md` | Sí (estructura) | [YO] Completar datos personales y pruebas | Bitácora obligatoria del TP |

---

## 4. 🐛 Errores o cosas mal que detecté en la respuesta de la IA

```
1. En una iteración anterior la implementación quedó incompleta (helpers creados pero
   controllers sin actualizar). Este prompt la retomó desde cero.

2. CalificacionesService instancia AlumnosService completo (con CursosService interno).
   Funciona pero crea más objetos de los necesarios — aceptable para un TP educativo.

3. validarCursoExiste pasó de devolver 400 a 404 cuando el curso no existe.
   Es semánticamente más correcto pero CAMBIA el contrato previo — verificar en Postman.

4. DELETE de alumno con calificaciones referenciadas ahora debería dar 409 vía mapPgError,
   no 404 engañoso como antes.

5. [YO] Revisar manualmente que la BD local tenga las tablas materias y calificaciones
   ejecutando databasecompleta.sql si aún no se hizo.
```

---

## 5. ✅ Verificación

Pegá el checklist de verificación del ejercicio y marcá lo que comprobaste **vos** (con qué evidencia: captura de Postman, salida de `npm test`, número de ms, etc.).

```
PENDIENTE — [YO] Ejecutar en Postman y marcar con capturas:

- [ ] POST /api/alumnos con {} → 400
- [ ] POST con datos inválidos → 400
- [ ] POST con id_curso inexistente → 404
- [ ] GET /api/alumnos/abc → 400
- [ ] DELETE /api/alumnos/abc → 400
- [ ] PUT /api/alumnos/abc → 400
- [ ] GET de un ID numérico inexistente → 404
- [ ] DELETE de un ID numérico inexistente → 404
- [ ] PUT con ID inválido → 400
- [ ] errores inesperados → 500 sin exponer detalles internos
- [ ] POST calificaciones nota inválida → 400
- [ ] POST calificaciones alumno inexistente → 404
- [ ] POST calificaciones materia inexistente → 404
- [ ] POST calificaciones duplicada alumno+materia → 409
- [ ] El id se valida con parsearId en GET, PUT y DELETE
- [ ] Los mensajes de error NO incluyen texto crudo de PostgreSQL
- [ ] La validación es consistente entre entidades
```

**Verificación técnica realizada por la IA (no sustituye Postman):**
```
- node --check sobre archivos JS modificados → sintaxis OK
- Las pruebas HTTP NO fueron ejecutadas contra la BD
```

---

## 6. ✍️ Reflexión (300–600 palabras)

[YO] Completar con tus palabras antes de entregar. Borrador base generado por IA:

```
El ejercicio me obligó a pensar en tres capas distintas de validación: sintaxis del
input (helper), reglas de negocio (service, como validarCursoExiste) y constraints de
BD (mapper en DbPg como red de seguridad).

Decidí validar en el service y no en el controller porque el controller ya tenía lógica
HTTP (status codes, parsearId) y el patrón existente de validarCursoExiste ya vivía
en el service. Los helpers quedaron como funciones puras reutilizables (parsearId,
validarTextoObligatorio, validarNota) sin agregar Joi/Zod.

Caso concreto obligatorio — POST /api/alumnos con body {}:
- ANTES: el repository convertía campos faltantes con ?? '' y ?? 0, insertaba un alumno
  vacío y respondía 201.
- PROBLEMA: el cliente creía que creó un alumno válido; además id_curso=0 podía fallar
  en FK de forma opaca.
- AHORA: el service exige nombre y apellido no vacíos → 400 con mensaje claro.
- POR QUÉ ES MEJOR: el error es responsabilidad del cliente (400), el mensaje es
  entendible, y no se persisten datos basura.

Para calificaciones, como la API no existía aún (solo materias-repository.js), creé
el CRUD completo siguiendo el patrón de cursos/alumnos, con validarAlumnoExiste y
validarMateriaExiste reutilizando services, y validarCalificacionNoDuplicada con 409
antes de llegar al UNIQUE de PostgreSQL.

Corregí de lo que propuso la IA: verificar que validarCursoExiste mantuviera su nombre
y patrón, revisar que no se modificara databasecompleta.sql, y completar la bitácora
con pruebas pendientes en lugar de afirmar que pasaron.
```

---

## 7. 🔗 Adjuntos

- [ ] Link/PDF de la conversación completa con la IA
- [ ] Commit(s) en GitHub: `[YO] Completar`
- [ ] Capturas / evidencias de verificación Postman
