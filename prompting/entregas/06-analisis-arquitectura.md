# Ejercicio 06 — Análisis de arquitectura

> Documento de análisis. **No incluye implementación** (ver sección final para la recomendación elegida a implementar en el próximo paso).

---

## 1. Descripción de la arquitectura actual

El proyecto implementa un CRUD de 4 entidades (`alumnos`, `cursos`, `materias`, `calificaciones`) más autenticación JWT, organizado en capas:

```
Controller → Service → Repository → DbPg → PostgreSQL
```

- **`controllers/`**: routers de Express. Leen `req`, llaman al service, devuelven status codes vía `respuestasHelper`. `POST`/`PUT`/`DELETE` están protegidos con `authMiddleware` (JWT); los `GET` son públicos.
- **`services/`**: clases con lógica de negocio — validación de input (`validaciones-helper.js`), reglas cruzadas entre entidades (existencia de FKs, no duplicados), y en el caso de `alumnos`, un campo calculado (`edad`).
- **`repositories/`**: una clase por tabla, arma el SQL (con ayuda de `sql-crud-helper.js`) y se lo delega a `DbPg`.
- **`DbPg`** (`repositories/db-pg.js`): concentra el `Pool` de `pg`, ejecuta las queries, y mapea errores de PostgreSQL a `AppError` tipados (`mapPgError`).
- **`entities/`**: clases `Alumno`/`Curso` usadas solo en un endpoint de demostración.
- **`helpers/`**: `LogHelper` (logging a archivo/consola configurable), `AppError` (errores tipados con status code), `respuestasHelper` (respuestas HTTP uniformes), `validaciones-helper.js` (validación de input), `sql-crud-helper.js` (generación de SQL CRUD genérico), `fechas-helper.js` (cálculo de edad).

Todas las queries son parametrizadas (`$1, $2...`), las credenciales salen de `.env` vía `dotenv`, y `db-config.js` permite alternar entre Postgres local y Supabase con una sola variable (`DB_TARGET`).

---

## 2. Flujo completo de una request

### Ejemplo simple — `GET /api/alumnos/5`

```
Cliente (Postman)
  │  GET /api/alumnos/5
  ▼
server.js               → app.use("/api/alumnos", AlumnosController)
  ▼
alumnos-controller.js   → router.get('/:id', ...)
  │                         parsearId('5') → 5 (valida formato)
  │                         currentService.getByIdAsync(5)
  ▼
alumnos-service.js      → getByIdAsync(5)
  │                         AlumnosRepository.getByIdAsync(5)
  │                         agregarEdad(alumno)  ← regla de negocio: campo derivado
  ▼
alumnos-repository.js   → getByIdAsync(5)
  │                         SQL: SELECT * FROM alumnos WHERE id=$1  (via sql-crud-helper)
  │                         this.db.queryOne(sql, [5])
  ▼
db-pg.js (DbPg)         → queryOne: toma el Pool (lazy), ejecuta la query
  │                         éxito con fila     → devuelve rows[0]
  │                         éxito sin fila     → devuelve null
  │                         error de Postgres  → mapPgError(error): loguea con LogHelper
  │                                                y LANZA un AppError tipado (no retorna)
  ▼
PostgreSQL
  ▼ (vuelta)
Controller: si returnEntity != null → 200 + JSON; si null → 404
Controller: si se lanzó un AppError → catch → respuestasHelper.responderError → status del AppError
```

### Ejemplo con cruce de services — `POST /api/calificaciones`

Este caso ilustra mejor el problema #1 de la sección siguiente, porque atraviesa 3 "familias" de repository:

```
CalificacionesController.post (con authMiddleware)
  └─ CalificacionesService.createAsync(entity)
       ├─ validarInputCalificacionCreate(entity)              [validaciones-helper]
       ├─ validarAlumnoExiste(id_alumno)
       │    └─ this.AlumnosService.getByIdAsync(id_alumno)     ← instancia PROPIA de AlumnosService
       │         └─ AlumnosRepository.getByIdAsync(...)        ← con su PROPIO DbPg/Pool
       ├─ validarMateriaExiste(id_materia)
       │    └─ this.MateriasService.getByIdAsync(id_materia)   ← instancia PROPIA de MateriasService
       │         └─ MateriasRepository.getByIdAsync(...)       ← con su PROPIO DbPg/Pool
       ├─ validarCalificacionNoDuplicada(id_alumno, id_materia)
       │    └─ CalificacionesRepository.getByAlumnoAndMateriaAsync(...)
       └─ CalificacionesRepository.createAsync(validado)       ← INSERT ... RETURNING id
```

Este único endpoint, por sí solo, termina usando repositories (y por lo tanto `DbPg`/`Pool`) que **no son los mismos objetos** que usan `alumnos-controller.js` o `materias-controller.js` para las mismas tablas — ver problema #1.

---

## 3. Qué ocurre en cada capa (evaluación crítica)

| Capa | Qué hace bien | Qué es discutible |
|---|---|---|
| Controller | Único lugar que conoce `req`/`res`/status codes; delega todo a `services`; usa `parsearId` y `respuestasHelper` de forma consistente en las 4 entidades | Tiene ramas de manejo de error (`!= null`, `> 0`) que ya no corresponden al contrato real de `DbPg` (ver problema #3) |
| Service | Centraliza validación de input y reglas cruzadas (FK existente, no duplicados, campo derivado); un service llama a otro service, nunca a un repository ajeno — respeta la capa | Instancia sus dependencias con `new` en el constructor sin compartir nada entre servicios equivalentes (ver problema #1); repite un chequeo de existencia que el repository vuelve a hacer (ver problema #2) |
| Repository | Un archivo por tabla, SQL parametrizado, usa `sql-crud-helper` para no repetir boilerplate de CRUD genérico | Repite el chequeo `previousEntity == null` que el service ya hizo (problema #2); cada instancia trae su propio `DbPg` (problema #1) |
| DbPg | Ya distingue "sin resultados" (`null`, caso de negocio) de "falló la consulta" (lanza `AppError` tipado vía `mapPgError`, mapeando `23505`/`23503`/`22P02` a códigos HTTP concretos) — **esto ya es una mejora sobre lo que describe `server-capas-explicacion.md`** | El `Pool` es por instancia, no compartido globalmente (problema #1) |
| Entities | `Alumno`/`Curso` documentan la forma de las tablas y sirven de ejemplo para crear objetos desde código | Solo se usan en un endpoint demo; no existen para `materias`/`calificaciones` — quedaron como pieza aislada, no como parte del flujo real de validación |
| Logging | `LogHelper` existe, es configurable por `.env`, y `DbPg` ya lo usa para errores reales de Postgres | `console.log` de trazas (63 ocurrencias) no pasa por `LogHelper`, no se puede apagar por entorno, y los controllers loguean errores esperados (400/404) con el mismo nivel de ruido que un 500 real |

---

## 4. Problemas / decisiones discutibles (evidencia, impacto, recomendación, trade-off)

| # | Problema / decisión | Evidencia concreta | Impacto | Recomendación | Trade-off | Prioridad |
|---|---|---|---|---|---|---|
| 1 | Un `Pool` por instancia de repository, multiplicado por composición de services anidados | `db-pg.js:14-19` (Pool lazy por instancia); `alumnos-repository.js:7` (`this.db = new Db()`); `alumnos-service.js:19` (`new CursosService()`); `calificaciones-service.js:17-18` (`new AlumnosService()` y `new MateriasService()`). Resultado: **8 instancias de repository** para 4 tablas al arrancar el server, no 4. | Hasta 8 `Pool` de conexiones independientes en vez de 1 compartido — contradice el motivo documentado para usar `Pool` en vez de `Client` | Convertir `DbPg` en singleton exportado (mismo patrón que `log-helper.js`) e importarlo en los repositories en vez de `new Db()` | Se gana un solo `Pool` real y config centralizada; se pierde nada funcional — cambio mecánico | **Alta** |
| 2 | `updateAsync` verifica existencia dos veces: una en el service (para el merge), otra en el repository (redundante) | `alumnos-service.js:48-49` y `alumnos-repository.js:46-47` (mismo patrón en `cursos-`, `materias-`, `calificaciones-*`) | Cada `PUT` hace un `SELECT` de más contra la misma fila | Quitar el chequeo `previousEntity == null` del repository; el service ya garantiza el contrato | Una consulta menos por `PUT`; el repository deja de ser "seguro" si se llamara fuera del flujo service→repository (no ocurre hoy) | **Media** |
| 3 | Ramas `else` en los controllers que ya no son alcanzables, restos del contrato viejo de `DbPg` (retornar `null`/`0`) | `alumnos-controller.js:41-46` (`if (returnArray != null) ... else responderInternalError`) y `:71-75` (`if (newId > 0) ... else responderBadRequestJson`); pero `queryAll`/`queryReturnId` en `db-pg.js` ya nunca retornan `null`/`0` — o devuelven el dato o `mapPgError` lanza | Código que sugiere un camino de error que ya no existe; confunde a quien lo lea o lo edite | Eliminar las ramas inalcanzables en `GET all` y `POST`, dejando el error solo en el `catch` | Código refleja el contrato real; riesgo si se confunde con las ramas de `PUT`/`DELETE`, que sí son alcanzables (`rowCount === 0` es un 404 legítimo) | **Media** |
| 4 | `console.log` de trazas sin control por entorno + doble logueo de errores + logueo de 400/404 como si fueran fallas | 63 ocurrencias de `console.log` en 18 archivos de `src/` (grep); `respuestas-helper.js:34` hace `console.log(error)` para todo error, incluso los que `mapPgError` ya logueó con `LogHelper` | Logs no controlables en producción sin tocar código; ruido: un `id` mal formado genera el mismo volumen de log que una caída real de la base | Quitar/condicionar los `console.log` de traza; loguear con `LogHelper` solo errores no esperados (los que no son `AppError`, o los `AppError` 500) | Logs limpios y útiles; requiere criterio para separar "debug" de "error real", no es solo borrar líneas | **Media-baja** |
| 5 | `entities/` (`Alumno`, `Curso`) sub-utilizadas y asimétricas respecto a `materias`/`calificaciones` | Solo se instancian en `alumnos-controller.js:19` (`GET /test-insert`); no existen clases para `Materia`/`Calificacion` | Ninguno funcional; señala que `entities/` no es parte del contrato real de validación (lo es `validaciones-helper.js`) | Dejarlo como está — no crear clases nuevas sin un caso de uso concreto que las necesite | No accionable hoy sin inventar trabajo | **Baja** |

---

## 5. Recomendación seleccionada para implementar

**Elegida: Problema #1 — `DbPg` como singleton compartido en vez de una instancia por repository.**

Por qué esta y no otra:

- Es la que el propio enunciado del ejercicio pregunta explícitamente ("¿debería haber un solo `Pool` compartido?"), y el análisis muestra que el problema real es **peor** de lo que el enunciado sugiere (8 pools, no 4, por la composición de services anidados) — hay algo concreto que corregir, no una sospecha genérica.
- Es **acotada**: toca `db-pg.js` (cambiar el export de clase a instancia, siguiendo el mismo patrón que ya usa `log-helper.js`) y los 4 repositories (reemplazar `this.db = new Db()` por el import del singleton). No requiere dependencias nuevas, no cambia ningún endpoint, no cambia ninguna respuesta HTTP, no toca la base de datos.
- Es **proporcional**: no introduce contenedores de inyección de dependencias ni patrones nuevos — reutiliza el mismo patrón singleton que el proyecto ya usa para `LogHelper`.
- Tiene beneficio real y medible: pasar de hasta 8 `Pool` (cada uno con `max: 10` conexiones por default de `pg`) a 1 solo `Pool` compartido con límite de conexiones controlado y predecible.
- Riesgo de implementarlo mal: si el singleton no se comporta igual en todos los repositories (por ejemplo, si alguno sigue haciendo `new Db()` por error), quedaría una migración a medias — hay que verificar los 4 repositories, no solo uno.

**No se implementa en esta etapa** — queda para el siguiente paso del ejercicio.
