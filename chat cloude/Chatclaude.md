# Ejercicios 06-09 — Arquitectura, Testing, Performance y Seguridad
_Exported on 8/14/2026 from Claude Code (Sonnet 5)_

---

**User**

Actuá como un **arquitecto de software senior especializado en Node.js, Express y arquitecturas en capas**, pero trabajando sobre un proyecto educativo. Tu tarea en este ejercicio NO es reescribir todo el proyecto ni aplicar patrones complejos por defecto: primero tenés que **analizar críticamente la arquitectura existente, detectar problemas reales en este proyecto y justificar cada recomendación con evidencia del código**.

## CONTEXTO DEL EJERCICIO

Este proyecto utiliza una arquitectura en capas aproximadamente organizada como:

`Controller → Service → Repository → DbPg → PostgreSQL`

El objetivo del Ejercicio 06 es utilizar la IA como **consultor de arquitectura**, no como generador automático de código.

El entregable principal será un documento de análisis arquitectónico y posteriormente se implementará solamente **una recomendación concreta**, de manera acotada.

## FUENTES OBLIGATORIAS

Antes de realizar cualquier análisis, revisá estas fuentes del proyecto:

1. Todo el código relevante dentro de `src/`.

2. El documento:
   `documents/server-capas-explicacion.md`

   Este archivo explica la arquitectura actual, las capas, el uso de `DbPg`, `Pool`, `Client`, queries parametrizadas, dotenv y otras decisiones existentes. Usalo como referencia para comprender la intención original de la arquitectura.

3. La base de datos completa:
   `documents/database/databasecompleta.sql`

   **ESTE ARCHIVO ES LA FUENTE DE VERDAD DE LA BASE DE DATOS.**

   Revisá su estructura completa antes de hacer cualquier recomendación relacionada con repositories, entidades, relaciones, tablas, claves primarias, claves foráneas, restricciones, `UNIQUE`, tipos de datos o cualquier otro aspecto relacionado con PostgreSQL.

   **NO modifiques este archivo.**

   **NO cambies nombres de tablas, columnas, relaciones, constraints ni estructura de la base de datos.**

   Si el código y el SQL parecen diferir, primero informame exactamente cuál es la diferencia. No inventes una estructura de BD alternativa ni "corrijas" automáticamente el SQL.

4. Revisá también `package.json`, `.env.example` o archivos equivalentes de configuración si existen, para comprender las dependencias y configuración actuales.

## REGLAS IMPORTANTES DEL PROYECTO

* Respetá la arquitectura y convenciones que ya existen.
* No agregues dependencias nuevas solamente porque podrían resultar más elegantes.
* No introduzcas Clean Architecture, DDD, CQRS, contenedores de inyección de dependencias ni otros patrones complejos salvo que exista una justificación concreta y proporcional al tamaño de este proyecto.
* No reescribas código todavía.
* No hagas cambios en la base de datos.
* No cambies nombres de tablas ni columnas.
* No elimines funcionalidades existentes.
* No modifiques endpoints existentes durante esta etapa.
* Las recomendaciones tienen que estar basadas en problemas reales encontrados en ESTE proyecto, no en problemas genéricos de Node.js.

## ASPECTOS QUE TENÉS QUE AUDITAR

Analizá especialmente:

### 1. Capa Service

Revisá `CursosService` y `AlumnosService`.

Analizá si tiene sentido que algunos services sean prácticamente un pass-through mientras otros contienen lógica de negocio, por ejemplo `calcularEdad` o `validarCursoExiste`.

No asumas que un service pass-through está necesariamente mal.

Explicá:

* qué responsabilidad debería tener la capa service;
* cuándo aporta valor;
* cuándo podría ser innecesaria;
* qué ventajas tiene mantenerla aunque actualmente tenga poca lógica;
* qué problema concreto aparecería si elimináramos esa capa.

### 2. Manejo de errores de DbPg

Revisá cómo `DbPg` maneja los errores.

Prestá especial atención al comportamiento donde el `catch` registra el error mediante `LogHelper.logError` y devuelve valores como `null` o `0`.

Analizá si esto permite diferenciar correctamente entre:

* "la consulta se ejecutó correctamente pero no había resultados";
* "la base de datos falló";
* "la consulta tuvo un error".

Explicá qué impacto tiene esto sobre Repository, Service y Controller.

### 3. Instancias de DbPg y Pool

Revisá cómo los repositories crean `DbPg`, especialmente si cada repository hace algo equivalente a:

`this.db = new Db()`

Analizá si eso implica múltiples instancias de `DbPg` y múltiples `Pool` de conexiones.

Compará conceptualmente:

* un Pool por repository;
* un Pool compartido por toda la aplicación.

Para cada alternativa indicá:

* ventajas;
* desventajas;
* impacto en este proyecto;
* cuándo tendría sentido cada enfoque.

No implementes todavía ningún cambio.

### 4. Entities

Revisá la carpeta `entities/` y las entidades `Alumno`, `Curso` u otras que existan.

Analizá:

* para qué parecen existir;
* si actualmente se utilizan realmente;
* si cumplen alguna responsabilidad;
* si están justificadas en la arquitectura actual;
* si sería correcto utilizarlas más o si eso agregaría complejidad innecesaria.

No las elimines.

### 5. Logging

Buscá los `console.log`, especialmente en controllers, services, repositories y configuración de base de datos.

Analizá:

* qué logs parecen ser de debugging;
* cuáles podrían ser útiles;
* si deberían centralizarse mediante `LogHelper`;
* qué problema tendría mantener `console.log` indiscriminadamente en producción.

No reemplaces todos los logs automáticamente.

## FORMATO DEL ANÁLISIS

Primero generá un análisis crítico y detallado.

Quiero una tabla con al menos estas columnas:

| Problema / decisión | Evidencia concreta en el código | Impacto | Recomendación | Trade-off | Prioridad |

Seleccioná finalmente entre **3 y 5 problemas o decisiones discutibles reales**.

Para cada recomendación explicá claramente:

1. Qué problema concreto resuelve.
2. Qué parte del código demuestra que el problema existe.
3. Qué cambiarías.
4. Qué ganamos.
5. Qué perdemos o qué riesgo introducimos.
6. Por qué la solución es proporcional a este proyecto.
7. Qué podría romperse si se implementa incorrectamente.

## IMPORTANTE: NO SEAS COMPLACIENTE

No quiero que simplemente digas que la arquitectura está bien.

Asumí que existen al menos **3 decisiones discutibles** y buscá activamente evidencia para encontrarlas.

Pero tampoco inventes problemas.

Si una decisión está bien para el tamaño y objetivo educativo del proyecto, decilo.

No recomiendes una solución solamente porque sea considerada "best practice". Relacioná siempre la recomendación con un problema concreto de este proyecto.

## DOCUMENTO DE ENTREGA

Después del análisis, creá:

`prompting/entregas/06-analisis-arquitectura.md`

El documento debe contener:

1. Título del ejercicio.
2. Descripción de la arquitectura actual.
3. Flujo completo de una request:
   `Cliente → Router → Controller → Service → Repository → DbPg → PostgreSQL → respuesta`

   Adaptalo al flujo real que encuentres en el código.
4. Una descripción de qué ocurre en cada capa.
5. Entre 3 y 5 problemas o decisiones discutibles reales.
6. Evidencia concreta de cada problema.
7. Impacto.
8. Recomendación.
9. Trade-off de cada recomendación.
10. Una sección final llamada **"Recomendación seleccionada para implementar"** donde elijas UNA sola recomendación.

La recomendación elegida debe ser:

* útil;
* acotada;
* justificable;
* proporcional al proyecto;
* y no debe requerir una reestructuración masiva.

## BITÁCORA OBLIGATORIA

Además, tenés que trabajar con la bitácora del TP.

Revisá la carpeta:

`prompting/bitacoras/`

y encontrá la plantilla existente:

`PLANTILLA - Bitacora de prompts y entrega.md`

**NO inventes una plantilla nueva.**

Leé la plantilla y respetá exactamente su estructura, títulos y campos.

Creá la carpeta `bitacoras` si no existe.

Luego creá la bitácora correspondiente al Ejercicio 06 dentro de:

`prompting/bitacoras/`

La bitácora tiene que documentar:

* el objetivo del prompt;
* qué información se le proporcionó a la IA;
* qué análisis realizó;
* qué decisiones surgieron;
* qué iteraciones o correcciones fueron necesarias;
* qué recomendación fue seleccionada;
* qué aprendí o qué decisión arquitectónica puedo defender oralmente.

**No inventes iteraciones que todavía no ocurrieron.** Documentá únicamente lo que realmente se haya hecho durante este ejercicio.

## IMPORTANTE SOBRE LA BASE DE DATOS

Antes de terminar, verificá nuevamente `documents/database/databasecompleta.sql`.

Quiero que confirmes que ninguna recomendación o análisis contradice:

* nombres reales de tablas;
* nombres reales de columnas;
* claves primarias;
* claves foráneas;
* restricciones;
* relaciones;
* tipos de datos.

No modifiques `databasecompleta.sql`.

Tampoco modifiques ningún otro script SQL.

## RESULTADO DE ESTA ETAPA

En esta primera etapa NO implementes todavía la recomendación.

Entregame:

1. El análisis arquitectónico.
2. `prompting/entregas/06-analisis-arquitectura.md`.
3. La bitácora del Ejercicio 06 siguiendo la plantilla existente.
4. La recomendación concreta que considerás más conveniente implementar en el siguiente paso.

No hagas cambios de código todavía.

---

**Claude**

I'll start by reading the key source files and documentation to build a grounded analysis.

*(Leyó `documents/server-capas-explicacion.md`, y luego en paralelo: `db-pg.js`, `alumnos-repository.js`, `cursos-repository.js`, `materias-repository.js`, `calificaciones-repository.js`, `alumnos-service.js`, `cursos-service.js`, `materias-service.js`, `calificaciones-service.js`, `auth-service.js`, `entities/alumno.js`, `entities/curso.js`, `db-config.js`, `log-helper.js`, `server.js`)*

This doc already flags several of the exact issues the exercise wants analyzed. Let me now read the actual source code and the DB schema to verify everything with evidence.

*(Leyó los controllers de las 4 entidades, `authMiddleware.js`, `app-error.js`, `respuestas-helper.js`, `sql-crud-helper.js`, `validaciones-helper.js`, `fechas-helper.js`, y `package.json`)*

The error handling in `db-pg.js` has clearly evolved past what the explanatory doc describes (it now throws typed `AppError`s instead of returning null/0 uniformly) — that's a real doc/code drift worth flagging. Let me check the remaining layers: controllers, helpers, and configuration.

*(Leyó `documents/database/databasecompleta.sql`, la plantilla de bitácora, `prompting/bitacoras/05-bitacora.md`, y `prompting/06 - Arquitectura de la aplicacion.md`)*

Now I have a very clear picture. Now I have solid evidence for all 5 audit areas. Let me compile findings...

## Análisis crítico

**Lo que encontré de valor**: el manejo de errores de `DbPg` ya NO es lo que describe `documents/server-capas-explicacion.md` ni el propio enunciado del Ejercicio 06 — ambos dicen que el `catch` de `DbPg` devuelve `null`/`0` silenciosamente. Eso es código viejo. El código actual (`db-pg.js`, con comentarios `// [IA]`) ya tiene `mapPgError()`, que loguea con `LogHelper` y **lanza** un `AppError` tipado (`23505` → conflict, `23503` → conflict, `22P02` → bad request, resto → internal). Es decir, uno de los "problemas" que pide auditar el enunciado ya fue resuelto en una iteración anterior del proyecto — pero dejó rastros inconsistentes que si son un problema real y verificable.

| Problema / decisión | Evidencia concreta | Impacto | Recomendación | Trade-off | Prioridad |
|---|---|---|---|---|---|
| **Un `Pool` de conexiones por cada instancia de repository, multiplicado por composición de services anidados** | `db-pg.js:14-19` crea el `Pool` de forma lazy por instancia. Cada repository hace `this.db = new Db()` (`alumnos-repository.js:7`, etc.). Pero además cada service anidado crea sus propias dependencias: `AlumnosService` crea `new CursosService()` (`alumnos-service.js:19`), y `CalificacionesService` crea `new AlumnosService()` **y** `new MateriasService()` (`calificaciones-service.js:17-18`). Como cada controller instancia su service a nivel de módulo (`const currentService = new XService()`), al arrancar el server esto termina creando **8 instancias de `AlumnosRepository`/`CursosRepository`/`MateriasRepository`/`CalificacionesRepository`** (no 4) — dos `AlumnosRepository` independientes, dos `CursosRepository` independientes, dos `MateriasRepository` independientes — cada una con su propio `Pool` lazy (default `max: 10` de `pg`). | Hasta 8 pools distintos para 4 tablas, en vez de 1. Cada `Pool` gestiona sus conexiones de forma aislada — nada comparte estado, nada comparte límite de conexiones. En un proyecto de práctica no tumba nada, pero es exactamente lo opuesto al motivo por el que se eligió `Pool` en vez de `Client` (explicado en el propio `server-capas-explicacion.md`). | Convertir `DbPg` en un singleton exportado (mismo patrón que ya usa `log-helper.js`: `export default new LogHelper()`) y que los repositories importen esa instancia en vez de hacer `new Db()`. | Se gana: un solo `Pool` real, configuración de conexión centralizada, comportamiento consistente con la intención documentada de "Pool compartido". Se pierde: nada funcional — es un cambio mecánico. Riesgo: si el singleton no maneja bien el cierre de conexiones en tests, podría quedar un handle abierto (no aplica en este proyecto porque no hay test suite todavía). | **Alta** |
| **Doble verificación de existencia (`getByIdAsync`) en `updateAsync`: una en el service, otra en el repository** | En **los 4 repositories** (`alumnos-repository.js:46-47`, `cursos-repository.js:32-33`, `materias-repository.js:32-33`, `calificaciones-repository.js:45-46`), `updateAsync` hace `const previousEntity = await this.getByIdAsync(id); if (previousEntity == null) return 0;`. Pero **los 4 services** ya hacen exactamente esa misma verificación antes de llamar al repository (`alumnos-service.js:48-49`, `cursos-service.js:33-34`, etc.) — y en el caso de `AlumnosService`/`CalificacionesService`, el resultado de esa consulta previa se usa además para el merge de campos parciales. | Cada `PUT` ejecuta **2 `SELECT` redundantes** contra la misma fila (uno en el service para el merge, uno en el repository que ya sabe que la entidad existe porque el service se lo pasó validado) más el `UPDATE`. No rompe nada, pero es una duplicación de lógica y de round-trips a la base evidenciable en el propio código, no una sospecha genérica. | Quitar el chequeo `previousEntity == null → return 0` del repository (dejar solo el `UPDATE`), ya que el contrato es que el service es quien decide si la entidad existe antes de llamar al repository. | Se gana: una consulta menos por `PUT`. Se pierde: el repository deja de ser "seguro" si algún día se lo llama sin pasar por el service (menos defensivo). Proporcional porque el proyecto ya asume ese contrato (controller → service → repository, nunca al revés). | **Media** |
| **Restos de un contrato de errores viejo: ramas `else` en los controllers que ya no pueden ejecutarse** | `alumnos-controller.js:41-46` (y el mismo patrón en `cursos-`, `materias-`, `calificaciones-controller.js`): `if (returnArray != null) {...} else { responderInternalError(...) }`. Pero `queryAll` en el `db-pg.js` actual **nunca devuelve `null`**: en éxito retorna `resultPg.rows` (array, puede ser `[]` pero no `null`), y en error `mapPgError` **lanza** (nunca retorna). Mismo patrón con `if (newId > 0) {...} else { responderBadRequestJson(...) }` en los `POST`: `queryReturnId` no puede devolver `0` ni `null`, siempre devuelve el id o lanza. | Código muerto que además **miente sobre el contrato real**: alguien que lea el controller cree que un error de base de datos cae en esa rama `else`, cuando en realidad ya cae en el `catch` con un `AppError` tipado. Es evidencia de que la migración de "devolver null/0" a "lanzar AppError" (marcada `// [IA]` en `db-pg.js`) no se propagó a los controllers que consumen esos métodos. | Eliminar esas ramas `else` inalcanzables (o documentarlas si se prefiere mantener defensivamente), dejando claro que el único camino de error es el `catch` → `responderError`. | Se gana: el código refleja el contrato real, menos confusión para quien lo lea o lo modifique. Se pierde: nada — es remoción de código muerto. Riesgo si se hace mal: quitar por error la rama que sí es alcanzable (la de `rowsAffected`/`rowCount` en `PUT`/`DELETE`, que **sí** puede ser `0` legítimamente porque significa "no existe", no "error"). Hay que distinguir bien cuál `else` es alcanzable y cuál no. | **Media** |
| **`console.log` de trazas sin control de entorno, mezclado con logging de errores duplicado y "ruidoso"** | 63 apariciones de `console.log` en 18 de los ~23 archivos de `src/` (confirmado con grep). Cada método de cada repository y service imprime una traza fija (`"AlumnosRepository-new.getAllAsync()"`, etc.) sin pasar por `LogHelper` ni por ninguna variable de entorno que los apague. Además, `respuestasHelper.responderError` (`respuestas-helper.js:34`) hace `console.log(error)` **de nuevo** aun cuando el error ya pasó por `LogHelper.logError` dentro de `mapPgError` — y lo hace también para errores esperados de validación (`AppError.badRequest`, 400), que no son fallas del sistema sino respuestas normales de negocio. | En producción esas trazas no se pueden apagar sin tocar código (a diferencia de `LogHelper`, que sí tiene `LOG_TO_CONSOLE_ENABLED`/`LOG_TO_FILE_ENABLED` en `.env`). Los errores de base de datos reales quedan logueados dos veces (una vez estructurado en `LogHelper`, otra como `console.log` plano), mientras que un simple `id` mal formado en la URL genera el mismo volumen de log que una caída de la base. | Sacar los `console.log` de traza de constructor/método (o dejarlos solo detrás de una env var tipo `DEBUG`), y en `responderError` loguear con `LogHelper` solo cuando **no** es un `AppError` esperado (i.e., solo los 500 reales), no los 400/404/409 que ya son parte del flujo normal. | Se gana: logs utilizables en producción, sin ruido, sin duplicación. Se pierde: hay que decidir un criterio de "qué es debug y qué es error" — trabajo de criterio, no solo de borrar líneas. Proporcional: no requiere una librería de logging nueva, solo usar lo que ya existe (`LogHelper`). | **Media-baja** |
| **`entities/` (`Alumno`, `Curso`) solo se usan en un endpoint de demostración, y no existen para `Materia`/`Calificacion`** | `Alumno`/`Curso` solo se instancian en `GET /api/alumnos/test-insert` (`alumnos-controller.js:19`). El resto del flujo real (`POST`/`PUT` de las 4 entidades) construye objetos planos validados por `validaciones-helper.js`, no por las clases de `entities/`. Las entidades agregadas después (`materias`, `calificaciones`) **no tienen clase** en `entities/` — asimetría real entre lo viejo y lo nuevo. | No es un bug, pero indica que `entities/` no forma parte del contrato real de validación/creación (eso lo hace `validaciones-helper.js` + `AppError`), sino que quedó como pieza pedagógica aislada del ejercicio original. | Dejarlo como está (es útil como ejemplo educativo de "objetos con estructura desde código") y no extenderlo a `Materia`/`Calificacion` a menos que aparezca un caso de uso real que las necesite (scripts, tests, seeds). | Se gana nada al tocarlo ahora; agregar clases para las 2 entidades nuevas "por consistencia" sería trabajo sin un problema concreto detrás — justo lo que el enunciado pide evitar. | **Baja (no accionable ahora)** |

**Sobre la capa Service (Curso/Materias vs Alumnos/Calificaciones)**: no es un problema. `CursosService`/`MateriasService` no son pass-through puros — sí validan input (`validarTextoObligatorio`) — simplemente no tienen reglas *inter-entidad* porque `cursos` y `materias` no tienen FKs entrantes que validar ni campos derivados que calcular. `AlumnosService` (FK a `cursos`, campo derivado `edad`) y `CalificacionesService` (FK doble + `UNIQUE(id_alumno, id_materia)`) tienen más reglas porque el dominio realmente lo exige. Sacar el service de `Cursos`/`Materias` para ir directo a repository ahorraría una clase, pero perderías el único lugar donde centralizar validación de input si mañana esas entidades ganan reglas propias — no vale la pena para 2 tablas.

**Verificación contra la base de datos**: confirmé `documents/database/databasecompleta.sql` — `cursos(id, nombre)`, `alumnos(id, nombre, apellido, id_curso→cursos.id, fecha_nacimiento, hace_deportes)`, `materias(id, nombre)`, `calificaciones(id, id_alumno→alumnos.id NOT NULL, id_materia→materias.id NOT NULL, nota, fecha, UNIQUE(id_alumno,id_materia))`. Ninguna de las 5 recomendaciones anteriores toca nombres de tabla, columnas, FKs ni constraints — todas son cambios de código en `src/`.

Ahora genero los dos entregables.

*(Creó `prompting/entregas/06-analisis-arquitectura.md` y `prompting/bitacoras/06-bitacora.md`)*

## Resumen

Análisis completo entregado en dos archivos, sin tocar `src/` ni la base de datos:

- **[06-analisis-arquitectura.md](prompting/entregas/06-analisis-arquitectura.md)** — flujo de request, tabla de 5 problemas con evidencia línea-por-línea, y recomendación final.
- **[06-bitacora.md](prompting/bitacoras/06-bitacora.md)** — siguiendo exactamente la plantilla existente (quedan campos `[YO] Completar` para datos personales y reflexión).

**Hallazgo clave que no está en el enunciado**: el manejo de errores de `DbPg` que tanto `server-capas-explicacion.md` como el propio enunciado del Ejercicio 06 describen como "silencioso" (`return null/0`) ya fue reemplazado en el código actual por `mapPgError()`, que lanza `AppError` tipados. Es documentación desactualizada, no un problema vigente — lo dejé documentado explícitamente en vez de repetirlo como hallazgo nuevo.

**Los 5 problemas reales encontrados**, en orden de prioridad: (1) hasta 8 `Pool` de conexiones distintos en vez de 1, por composición de services anidados — peor que lo que sugiere el propio enunciado; (2) doble verificación de existencia (service + repository) en cada `PUT`; (3) ramas `else` muertas en los controllers, resabio del contrato viejo de errores; (4) `console.log` de trazas sin control de entorno + logueo duplicado de errores; (5) `entities/` sub-utilizadas y asimétricas.

**Recomendación seleccionada para implementar**: convertir `DbPg` en singleton compartido (mismo patrón que ya usa `log-helper.js`), en vez de que cada repository haga `new Db()`. Es acotado, no toca la BD ni ningún endpoint, y responde directamente a lo que el enunciado pregunta.

No implementé nada todavía — decime si querés que avance con esa recomendación.

---

**User**

Actuá como un **ingeniero de software senior especializado en testing de aplicaciones Node.js y Express**, trabajando sobre un proyecto educativo existente.

En este ejercicio NO quiero que generes tests inmediatamente. Primero quiero que **audites el proyecto, identifiques qué vale la pena probar, diseñes los casos de prueba y elijas una estrategia de testing adecuada**. Después, en un segundo paso, vamos a implementar los tests.

El objetivo es aprender a diferenciar entre:

* un test que realmente verifica un comportamiento;
* un test tautológico que siempre pasa;
* un caso normal/happy path;
* un caso borde;
* un error de entrada;
* y un error de infraestructura o integración.

## CONTEXTO DEL PROYECTO

El proyecto es un backend desarrollado con **Node.js + Express + PostgreSQL**, organizado en capas:

`Controller → Service → Repository → DbPg → PostgreSQL`

Actualmente el proyecto se prueba principalmente de forma manual mediante Postman y no cuenta con una estrategia de testing automatizado completa.

El foco del ejercicio es agregar tests sin romper la arquitectura existente.

## FUENTES OBLIGATORIAS

Antes de analizar o proponer cualquier test, revisá:

1. Todo el código relevante de `src/`.
2. `package.json`, para comprobar qué dependencias y scripts existen actualmente.
3. `alumnos-service.js`, especialmente la función:
   `calcularEdad(fechaNacimiento)`
4. La lógica de `validarCursoExiste`.
5. Los controllers y repositories de alumnos.
6. Los endpoints existentes que puedan servir para realizar una prueba de integración.
7. Cualquier archivo de configuración relacionado con el arranque del servidor.
8. El documento de arquitectura:
   `documents/server-capas-explicacion.md`
9. **La base de datos completa:**
   `documents/database/databasecompleta.sql`

### REGLA FUNDAMENTAL SOBRE LA BASE DE DATOS

`documents/database/databasecompleta.sql` es la **fuente de verdad de la estructura de PostgreSQL**.

Revisá el SQL antes de diseñar cualquier test que dependa de datos de la BD.

Prestá atención a:

* nombres reales de tablas;
* nombres reales de columnas;
* tipos de datos;
* claves primarias;
* claves foráneas;
* restricciones;
* valores `UNIQUE`;
* datos iniciales/seed existentes;
* relaciones entre entidades.

**NO modifiques `databasecompleta.sql`.**

**NO cambies nombres de tablas o columnas.**

**NO inventes tablas, relaciones o datos que no existan en el SQL.**

Si un test de integración necesita datos existentes, utilizá la estructura y los datos que realmente surjan de `databasecompleta.sql`.

Si el código y el SQL presentan alguna diferencia, informala antes de asumir cómo debería funcionar.

## REGLAS DEL EJERCICIO

No quiero que agregues Jest, Vitest, Mocha u otro framework automáticamente.

Primero analizá qué opción es más adecuada para este proyecto.

Considerá especialmente:

* `node:test`, por ser nativo de Node;
* Jest;
* Vitest;
* Supertest para integración HTTP, si resulta necesario.

La elección tiene que justificarse según:

* dependencias;
* complejidad;
* facilidad de configuración;
* compatibilidad con la versión actual de Node;
* tamaño del proyecto;
* y necesidades reales del ejercicio.

No agregues una dependencia si no es necesaria.

## PRIMER ANÁLISIS: CALCULAR EDAD

Analizá en profundidad:

`calcularEdad(fechaNacimiento)`

Antes de escribir código, generá una tabla de casos de prueba.

Para cada caso indicá:

| Caso | Entrada | Resultado esperado | Tipo de caso | Por qué es importante |

Como mínimo considerá:

* una fecha de nacimiento normal;
* una persona que cumple años exactamente hoy;
* una persona que todavía no cumplió años este año;
* una persona que ya cumplió años;
* una fecha futura;
* una fecha inválida;
* `null`;
* `undefined`;
* un valor que no sea una fecha;
* un `Date` inválido;
* cualquier otro caso borde que encuentres al analizar realmente la implementación.

### MUY IMPORTANTE: NO COPIAR EL COMPORTAMIENTO ACTUAL COMO EXPECTATIVA

Los resultados esperados deben estar determinados por el comportamiento que **debería tener la función**, no simplemente por ejecutar la función y copiar el resultado.

No generes tests equivalentes a:

`calcularEdad(fecha) === calcularEdad(fecha)`

ni ningún otro test tautológico.

Si la implementación actual tiene un comportamiento discutible frente a una entrada inválida, señalalo y explicá qué debería verificarse.

## FECHAS

Prestá especial atención a los tests que dependen de la fecha actual.

No quiero tests frágiles que funcionen hoy pero fallen mañana.

Analizá si conviene:

* usar fechas fijas;
* controlar/mokear la fecha actual;
* o diseñar los casos de otra manera.

No asumas una solución sin revisar primero cómo está implementada `calcularEdad`.

También investigá el comportamiento de JavaScript frente a:

`new Date("texto")`

y otros valores inválidos si resultan relevantes.

## VALIDAR CURSO

Analizá también:

`validarCursoExiste`

Determiná:

* qué comportamiento debería verificarse;
* qué ocurre cuando el curso existe;
* qué ocurre cuando no existe;
* qué tipo de error genera;
* qué dependencias necesita para poder testearse;
* si conviene realizar un test unitario aislando el repository/service o si es más apropiado probarlo mediante integración.

No escribas todavía el test.

## TEST DE INTEGRACIÓN

Analizá los endpoints existentes y seleccioná **al menos uno** que tenga sentido probar mediante integración.

Preferentemente elegí un endpoint que permita verificar:

* status code;
* body;
* y comportamiento real del controller.

Explicá:

* qué endpoint elegiste;
* por qué;
* qué datos necesita;
* si requiere PostgreSQL;
* si conviene utilizar la aplicación real;
* y qué riesgos existen al hacer depender el test de una BD real.

El test de integración debe verificar como mínimo **status code y body**.

## DATOS DE PRUEBA

Si es útil, proponé un pequeño conjunto de datos de prueba.

Pero los datos relacionados con PostgreSQL tienen que ser compatibles con:

`documents/database/databasecompleta.sql`

No inventes IDs suponiendo que existen.

## ELECCIÓN DEL TEST RUNNER

Después del análisis, recomendá una estrategia concreta.

Por ejemplo:

* `node:test` para unitarios;
* `supertest` para integración;

pero no la elijas automáticamente. Justificala según el proyecto.

Explicá:

1. qué dependencias habría que agregar;
2. cuáles ya existen;
3. qué archivos habría que crear;
4. qué scripts habría que modificar;
5. cómo se ejecutarían los tests.

## CRITERIO DE CALIDAD

Antes de terminar el análisis, asegurate de que los tests propuestos puedan detectar errores reales.

Para `calcularEdad`, específicamente, tiene que existir al menos un caso que **falle si cambiamos intencionalmente la lógica de cálculo**.

Explicá cuál sería ese caso y por qué detectaría el error.

## DOCUMENTO DE ENTREGA

Creá:

`prompting/entregas/07-analisis-testing.md`

El documento debe contener:

1. Objetivo del testing.
2. Estado actual del proyecto.
3. Test runner elegido y justificación.
4. Análisis de `calcularEdad`.
5. Tabla completa de casos borde.
6. Análisis de `validarCursoExiste`.
7. Endpoint seleccionado para integración.
8. Datos necesarios para las pruebas.
9. Riesgos de tests frágiles o tautológicos.
10. Estrategia final de testing.
11. Lista de tests que se implementarán en el siguiente paso.

No implementes todavía los tests.

## BITÁCORA OBLIGATORIA

Revisá:

`prompting/bitacoras/`

y encontrá:

`PLANTILLA - Bitacora de prompts y entrega.md`

**Usá exactamente esa plantilla. No inventes otra estructura.**

Si la carpeta `bitacoras` no existe, creala.

Creá la bitácora correspondiente al Ejercicio 07.

La bitácora debe registrar solamente lo que realmente ocurrió durante el proceso.

Incluí:

* objetivo;
* prompt utilizado;
* análisis realizado;
* casos de prueba propuestos;
* decisiones tomadas;
* elección del test runner;
* posibles problemas detectados;
* decisiones que haya tomado el alumno frente a las propuestas de la IA.

**No inventes iteraciones ni decisiones que todavía no ocurrieron.**

## RESULTADO DE ESTA ETAPA

No escribas todavía los tests.

Entregame:

1. El análisis de testing.
2. `prompting/entregas/07-analisis-testing.md`.
3. La bitácora del Ejercicio 07 siguiendo la plantilla existente.
4. La estrategia concreta que se implementará en el siguiente prompt.
5. La lista final de casos de prueba que deben convertirse en código.

No hagas cambios en `databasecompleta.sql` ni en ningún otro archivo SQL.

---

**Claude**

Let me verify the current tooling state — Node version, existing test scripts, and re-confirm the exact `calcularEdad`/`validarCursoExiste` code and the alumnos repository/controller before designing cases.

*(Corrió `node --version` → v24.13.1; revisó `scripts/` y `package.json`; leyó `.env-template`)*

Node v24.13.1 — very modern, node:test has full support including built-in mock timers. This strengthens the case for node:test as the built-in choice: zero new dependencies, native to the runtime.

*(Leyó `scripts/test-ej05-auth.mjs` para entender el precedente de testing ad-hoc del proyecto)*

This is a hand-rolled ad-hoc integration script using `fetch` against a running server, no test framework, no assertion library. Useful prior art but not a "real" test framework.

*(Leyó `documents/database/databasecompleta.sql` y `documents/database/script-postgress.sql`, y la plantilla + `05-bitacora.md`)*

The `documents/database/` folder has an important discrepancy I need to flag: `databasecompleta.sql` (the declared source of truth) has the `alumnos` INSERTs replaced by a placeholder comment ("ACÁ VAN EXACTAMENTE TODOS LOS INSERTS..."), while a *different* file, `script-postgress.sql`, actually contains 154 real alumno rows. Since the instructions say not to assume data that isn't confirmed in the source of truth, I'll treat `alumnos` seed data as unconfirmed and base any integration test on `cursos`/`materias`, which **do** have concrete, unambiguous `INSERT` statements in `databasecompleta.sql`. I'll flag this explicitly in the deliverable.

*(Creó `prompting/entregas/07-analisis-testing.md` y `prompting/bitacoras/07-bitacora.md`)*

## Resumen

Análisis de testing entregado en dos archivos, sin implementar código ni tocar SQL:

- **[07-analisis-testing.md](prompting/entregas/07-analisis-testing.md)**
- **[07-bitacora.md](prompting/bitacoras/07-bitacora.md)**

**Hallazgo que no estaba en el enunciado**: `documents/database/databasecompleta.sql` (la fuente de verdad declarada) tiene un **placeholder** en lugar de los `INSERT` reales de `alumnos` — solo un comentario. Los datos reales de alumnos (154 filas) están en un archivo distinto, `script-postgress.sql`, que no es la fuente de verdad. Por eso descarté cualquier test de integración sobre `/api/alumnos` con IDs asumidos, y elegí `GET /api/cursos` (5 cursos sí confirmados en la fuente de verdad), buscando por `nombre` en vez de por `id`.

**Test runner**: `node:test` + `node:assert/strict`, cero dependencias nuevas — Node instalado es v24.13.1, y el proyecto ya tiene un precedente de integración con `fetch` nativo (`scripts/test-ej05-auth.mjs`) que hace innecesario sumar Supertest por ahora.

**`calcularEdad`**: tabla de 13 casos. El caso clave que garantiza que el test *detecta* un bug real es "cumpleaños exactamente hoy" — si alguien cambia `<` por `<=` en la comparación de días, ese caso específico falla. Encontré 4 puntos reales del código que quedan marcados como "discutibles" (no como bugs a corregir automáticamente): fecha inválida → `NaN` en vez de error/`null`; fecha futura → edad negativa sin protección; valores no-fecha *truthy* (booleans, timestamps) aceptados sin validar tipo.

**`validarCursoExiste`**: recomendé test unitario reemplazando `service.CursosService` por un fake — no hace falta tocar código de producción porque esa propiedad ya es pública.

**Pendiente antes de implementar**: decidir si `calcularEdad` se corrige para ser más defensiva ante fecha futura/inválida/no-fecha, o si se documentan como límite conocido. Avisame cuál preferís y seguimos con la implementación.

---

**User**

Quiero que trabajes conmigo en el Ejercicio 08 — Performance y optimización de este TP de Prompting.

IMPORTANTE: este ejercicio debe realizarse sobre EL PROYECTO REAL que tenés abierto. No inventes archivos, tablas, columnas, relaciones, endpoints ni estructuras que no existan. Antes de modificar cualquier código, inspeccioná y comprendé la estructura actual del proyecto.

[Nota del export: el prompt completo del Ejercicio 08 —auditoría de performance, medición obligatoria antes/después, paginación, N+1, Pool, índices, reglas sobre la BD, validaciones de casos borde, optimización descartada, bitácora e informe— se reproduce íntegro más abajo en el archivo de origen de la conversación; se omite aquí por longitud, pero el contenido completo del prompt está disponible en el historial real del chat.]

Antes de terminar, revisá nuevamente los cambios y confirmá que no modificaste nombres ni estructuras de la base de datos y que los endpoints existentes continúan funcionando.

IMPORTANTE: si en algún punto encontrás información insuficiente en el código o en la documentación, no inventes una respuesta. Indicá exactamente qué falta y continuá solamente con aquello que pueda comprobarse.

---

**Claude**

This is a large multi-phase task. I'll start with the audit-only phase — no code changes yet. Let me re-verify the current state of the repositories, `DbPg`, config, and the DB schema, plus check whether I can actually connect to Postgres for real measurements.

*(Corrió `git status`/`git log`, chequeó `.env` sin exponer el password, buscó `pg`/`autocannon` en `node_modules`)*

*(Corrió `npm install` — instaló 97 paquetes)*

*(Probó la conexión a Supabase con un script Node ad-hoc → `ERROR: (ENOTFOUND) tenant/user postgres.eozcrunsuompyeapymze not found`)*

Local Postgres is reachable, but the `DAI` database doesn't exist yet there (Supabase auth is failing on a tenant-lookup error, likely a stale/paused project — not something I should try to work around). Let me check what's available locally and set up a local test database from the real schema file.

*(Probó conexión local → `ERROR (local): no existe la base de datos «DAI»`; listó bases disponibles en el Postgres local → solo `postgres`, versión 16.2)*

*(Releyó `alumnos-repository.js`, `db-pg.js`, `alumnos-service.js`, `alumnos-controller.js`, `sql-crud-helper.js`, `db-config.js`, `server.js` — confirmado: sin cambios desde el Ejercicio 06)*

## Auditoría de performance (sin modificar código todavía)

Verifiqué cada sospecha del enunciado contra el código real antes de darla por válida. Dos de ellas **no se confirman**:

- **Patrón N+1**: revisé `alumnos-repository.js`, `alumnos-service.js` y `calificaciones-service.js`. Ningún listado (`getAllAsync`) hace una query adicional por fila. **No existe N+1 real hoy.**
- **Índices**: `databasecompleta.sql` no tiene ningún `CREATE INDEX`, solo los índices automáticos de `PRIMARY KEY` y del `UNIQUE(id_alumno, id_materia)` en `calificaciones`. La única consulta con `WHERE` sobre columnas FK (`getByAlumnoAndMateriaAsync`) **ya está cubierta** por ese índice. No hay ninguna consulta que filtre por `alumnos.id_curso` hoy. **No hay evidencia que justifique un índice nuevo.**

| # | Problema | Archivo | Endpoint/consulta | Evidencia | Impacto | Dificultad | Riesgo de romper contrato | Prioridad |
|---|---|---|---|---|---|---|---|---|
| 1 | `GET /api/alumnos` sin paginación (trae todas las filas siempre) | `alumnos-repository.js:12`, `alumnos-controller.js:38-50` | `GET /api/alumnos` | `getAllAsync` ejecuta `SELECT * FROM alumnos` sin `LIMIT`/`OFFSET`; el controller no lee `req.query` | Crece linealmente con la cantidad de alumnos | Media | Medio — cambia el shape de la respuesta | **ALTA** |
| 2 | `updateAsync` hace un `SELECT` redundante (service Y repository verifican existencia) | `alumnos-service.js:48-49` y `alumnos-repository.js:46-47` (mismo patrón en cursos/materias/calificaciones) | `PUT /api/alumnos/:id` | El service ya hace `getByIdAsync` para el merge; el repository vuelve a hacer `getByIdAsync` antes del `UPDATE` | 1 query de más por cada `PUT` | Baja | Bajo | **MEDIA** |
| 3 | `Pool` por instancia de repository (hasta 8 pools por composición de services anidados) | `db-pg.js:14-19`, `alumnos-repository.js:7`, `alumnos-service.js:19`, `calificaciones-service.js:17-18` | Todos | Cada repository hace `new Db()`; services anidados crean sus propias dependencias | Real arquitectónicamente, pero impacto en tiempo de respuesta ~0 en este proyecto | Baja-media | Bajo | **MEDIA** |
| 4 | `SELECT *` genérico (todas las columnas, en las 4 tablas) | `sql-crud-helper.js:1-7` | Todos los `getAll`/`getById` | `buildSelectAllSql`/`buildSelectByIdSql` no reciben columnas explícitas | Bajo hoy: tablas angostas, sin `TEXT` largo ni binarios | Baja | Bajo | **BAJA** |
| 5 | Índice nuevo en `alumnos.id_curso` o similar | — | — | **Verificado y descartado**: ninguna consulta actual filtra por esa columna | N/A | — | — | **Descartada** |
| 6 | Patrón N+1 en listados | — | — | **Verificado y descartado**: no existe en el código actual | N/A | — | — | **No aplica** |

### Sobre el contrato de `GET /api/alumnos`

Hoy responde `200` + un **array JSON plano**. Para que la paginación resuelva realmente el problema #1 por defecto, tiene que aplicar un límite incluso sin query params — lo cual cambia el shape de la respuesta de array a objeto (`{ data, page, limit, total }`). Es un cambio de contrato real y lo voy a documentar explícitamente. Verifiqué que ningún otro service depende de que `AlumnosService.getAllAsync()` devuelva un array plano.

## Medición ANTES

No hay datos suficientes en el proyecto para que una medición sea significativa: `databasecompleta.sql` (fuente de verdad) solo trae 5 `cursos` y 5 `materias` — la sección de `alumnos` es un comentario placeholder, sin filas reales (esto ya lo había detectado en el Ejercicio 07). Conecté ambas bases configuradas en `.env`: Supabase devuelve un error de autenticación a nivel de pooler (probablemente un proyecto pausado o credenciales vencidas — no es algo que deba intentar arreglar yo), pero **Postgres local sí está corriendo** (v16.2, solo con la base `postgres` default).

Mi plan, sin modificar `.env` ni `databasecompleta.sql`:
1. Crear una base local `DAI` y ejecutarle `databasecompleta.sql` tal cual (sin editarlo).
2. Generar datos sintéticos de `alumnos` (nombres no reales, para no usar PII) respetando exactamente el schema.
3. Levantar el server real apuntando a esa base local vía `DB_TARGET=local` **como variable de entorno al lanzar el proceso**, sin tocar la línea de `.env` que vos dejaste en `"supabase"` (dotenv no sobreescribe variables ya seteadas en el proceso).
4. Medir `GET /api/alumnos` con `fetch` + `performance.now()` (sin dependencias nuevas, mismo patrón que ya usa `scripts/test-ej05-auth.mjs`).

¿Confirmás que puedo crear esa base `DAI` local y cargarle datos sintéticos para la medición? Es una acción local y reversible (no toca Supabase ni tus archivos versionados), pero prefiero confirmarlo antes de crear una base de datos nueva.

---

**User**

Quiero que trabajes conmigo en el Ejercicio 09 — Seguridad de este TP de Prompting.

[Nota del export: el prompt completo del Ejercicio 09 —auditoría de secretos/Git, fuga de información en errores, errores tragados en DbPg, CORS, JWT, SQL Injection, clasificación de vulnerabilidades, decisión sobre qué corregir, implementación de correcciones, verificación, informe y bitácora obligatorios— se reproduce íntegro en el historial real del chat; se omite aquí por longitud.]

---

**Claude**

Nota: el Ejercicio 08 (performance) quedó pausado esperando tu confirmación para crear una base de datos local de prueba — lo dejo así y me dedico de lleno al Ejercicio 09 ahora, como pediste.

*(Chequeó `.gitignore`, `git ls-files`, `git log --all --full-history -- .env`, y leyó `README.md`)*

**Critical finding**: `.env` appears to be currently tracked by Git despite being listed in `.gitignore`. Let me verify this precisely.

*(Corrió `git ls-files -- .env`, `git status --short .env`, `git log --oneline -- .env`, `git show <commit>:.env` con los valores redactados, y `git diff HEAD -- .env`)*

Confirmed CRITICAL finding: `.env` is tracked by git, has been since the "Initial commit", and was updated again in the "Ej5" commit. `git diff HEAD -- .env` returns empty, meaning the current working-tree `.env` is IDENTICAL to what's committed in HEAD.

*(Corrió `git remote -v`, `git branch -vv`, `git branch -r --contains`)*

Confirmed: `origin/main` on GitHub contains both commits with `.env`. Given the repo name literally contains "public" and it's pushed to GitHub, this is strong circumstantial evidence these credentials are exposed publicly right now.

*(Buscó referencias a CORS/frontend en el repo; revisó `documents/postman/` y `documents/proyecto-base-referencia-tecnica.md`; grepeó patrones de SQL en `src/`)*

*(Levantó el server apuntado a la base local, y probó un `POST` con JSON malformado)*

Confirmed and reproduced empirically: malformed JSON to any endpoint (even ones with `authMiddleware`, since this fires *before* auth) leaks a full stack trace with absolute filesystem paths via Express's default error handler — because there's no global error-handling middleware in `server.js`. Let me clean up the test server and verify the Postgres-error path (`mapPgError`) with a real DB error.

*(Verificó que el puerto 3000 estaba libre, y probó un error real de Postgres directamente contra `DbPg`)*

This confirms: the `DbPg` → `mapPgError` → `AppError` → `responderError` chain is ALREADY properly sanitized — no raw Postgres error text, no table names, no file paths reached the client-facing `message` field.

## Auditoría de seguridad (sin modificar código todavía)

### 🔴 Hallazgo crítico — confirmado con `git log`

**`.env` está trackeado por Git y fue pusheado al repo remoto**, a pesar de estar listado en `.gitignore`. Ahora mismo, en GitHub, están expuestos: `DB_LOCAL_PASSWORD`, `DB_SUPABASE_USER`/`DB_SUPABASE_PASSWORD`, `JWT_SECRET` y `AUTH_PASSWORD`. No imprimo ningún valor real acá.

### 🟠 Hallazgo alto — confirmado empíricamente

**Fuga de stack trace + rutas absolutas del filesystem ante JSON malformado**, y ocurre **sin autenticación** (antes de que `authMiddleware` corra), porque `server.js` no registra un middleware de error global.

### 🟡 Hallazgos medios

- **CORS abierto a cualquier origen** — `Access-Control-Allow-Origin: *` confirmado. No existe ningún frontend documentado en el proyecto.
- **`.env-template` usa `admin`/`admin123`** como si fueran valores utilizables.

### 🟢 Hallazgos bajos

- **`X-Powered-By: Express`** presente — fingerprinting menor.

### ✅ Verificado y descartado explícitamente

| Sospecha | Por qué se descarta |
|---|---|
| **SQL Injection** | Todas las queries usan `$1, $2...` + array de `values`. La única interpolación de string es sobre `tableName`/`pkName`, siempre literales hardcodeados, nunca de `req.params`/`req.body`. |
| **Errores de Postgres crudos llegando al cliente** | Probado directo contra `DbPg`: el cliente vería `{"message": "Error interno del servidor."}` genérico. |
| **`catch → log → return null/0` en `DbPg`** | Ya no aplica — hoy `DbPg` lanza `AppError` ante cualquier fallo real. |
| **JWT hardcodeado / mal validado** | `jwt.verify` (no `decode`), secreto desde `process.env.JWT_SECRET`, expiración configurable, distingue 401 por causa. |

### Antes de corregir, necesito confirmar dos cosas con vos

1. **Rotación de credenciales**: esto lo tenés que hacer vos, no tengo acceso a tu Supabase.
2. **¿Reescribir el historial de Git?** No lo voy a hacer sin que lo pidas explícitamente — mi recomendación es rotar, no reescribir historial.

Si confirmás, avanzo con: sacar `.env` del índice de Git, agregar el middleware de error global, restringir CORS con allowlist por `.env`, limpiar `.env-template`, y deshabilitar `X-Powered-By`.

---

**User**

[Request interrupted by user]
Actuá como un auditor senior de backend especializado en Node.js, Express y PostgreSQL.

Quiero que hagas una AUDITORÍA COMPLETA DEL CÓDIGO ACTUAL DEL PROYECTO. En esta etapa NO MODIFIQUES NINGÚN ARCHIVO, NO CREES CÓDIGO NUEVO Y NO CORRIJAS AUTOMÁTICAMENTE NADA. Primero quiero detectar todos los problemas reales para después decidir qué corregir.

[Nota del export: el prompt completo —auditoría exhaustiva de errores funcionales, errores de arquitectura, errores de base de datos, validaciones, manejo de errores, JWT, seguridad, performance, testing, y consistencia, con formato de tabla obligatorio (# | Severidad | Categoría | Archivo | Problema | Evidencia | Impacto | ¿Error real o falsa alarma?) y secciones 1-7— se reproduce íntegro en el historial real del chat; se omite aquí por longitud.]

NO MODIFIQUES ARCHIVOS TODAVÍA.

NO GENERES UN PATCH.

NO HAGAS COMMIT.

Primero quiero solamente la auditoría y el diagnóstico.

La idea es que yo pueda revisar tus conclusiones y decidir después qué problemas corregir.

---

**Claude**

This is a broader, audit-only request superseding the security-focused one — no file changes, no patches, no commits. I already have substantial verified findings from this session, but let me verify a few more specific things across the whole codebase: a suspected date-validation gap, full `authMiddleware` coverage consistency, and confirm no test files exist yet.

*(Verificó en Node el comportamiento de `new Date("2024-02-30T00:00:00")` → rollover silencioso a marzo; grepeó `authMiddleware` en todos los controllers; buscó archivos `*.test.js` y carpeta `test/`)*

Confirmed: `new Date("2024-02-30T00:00:00")` rolls over to March 1 silently, confirming the `validarFechaOpcional` gap. Also confirmed `authMiddleware` coverage is consistent across all 4 entity controllers. No test files exist in `src/`.

# Auditoría completa — solo diagnóstico (sin modificar código)

## Tabla de hallazgos

| # | Severidad | Categoría | Archivo | Problema | Evidencia | Impacto | ¿Real o falsa alarma? |
|---|---|---|---|---|---|---|---|
| 1 | 🔴 CRÍTICO | Seguridad / Secretos | `.env` (repo completo) | `.env` está trackeado por Git y pusheado al remoto | `git log`/`git branch -r --contains` | DB passwords, `JWT_SECRET`, `AUTH_PASSWORD` expuestos en el historial público | **Real** |
| 2 | 🟠 ALTO | Manejo de errores / Seguridad | `src/server.js` | JSON malformado dispara el manejador default de Express: stack trace + rutas absolutas | Reproducido con `curl` | Se dispara sin autenticación | **Real**, confirmado empíricamente |
| 3 | 🟠 ALTO | Validaciones / Manejo de errores | `validaciones-helper.js` (`validarFechaOpcional`) | Acepta fechas de calendario imposibles (`"2024-02-30"`) por rollover de JS `Date`; Postgres sí las rechaza (código `22008`, no mapeado en `mapPgError`) | Confirmado en Node | Pasa validación (400 esperado) pero explota en la BD real → 500 | **Real** |
| 4 | 🟡 MEDIO | Consistencia / Código muerto | Las 4 controllers | Ramas `else` inalcanzables (`GET`/`POST`) desde que `DbPg` lanza en vez de devolver `null`/`0` | Lectura de `db-pg.js` vs. los 4 controllers | No rompe nada, pero miente sobre el contrato | **Real**, solo afecta claridad |
| 5 | 🟡 MEDIO | Seguridad | `server.js:17` | CORS abierto a cualquier origen | Header confirmado con `curl` | Cualquier página puede llamar a la API desde el navegador | **Real** |
| 6 | 🟡 MEDIO | Arquitectura / Performance | Las 4 repositories (`updateAsync`) | `SELECT` redundante service+repository | Comparación línea a línea | 1 query de más por `PUT` | **Real** (ya detectado en Ej. 06) |
| 7 | 🟡 MEDIO | Arquitectura / Performance | `db-pg.js` + services anidados | Hasta 8 instancias de Pool para 4 tablas | Trazado de constructors | Impacto real bajo en este proyecto | **Real** (ya detectado en Ej. 06) |
| 8 | 🟡 MEDIO | Performance | `alumnos-repository.js`/controller | Sin paginación, `SELECT *` sin límite | — | Crece linealmente | **Real** (ya detectado en Ej. 08) |
| 9 | 🟡 MEDIO | Base de datos / Validación | `databasecompleta.sql` vs `validarNota` | Rango 0-10 solo en JS, sin `CHECK` en la BD | Lectura completa del SQL | Sin barrera en la BD si algo inserta directo | **Real**, requiere tu decisión |
| 10 | 🟡 MEDIO | Secretos | `.env-template` | `admin`/`admin123` sin marcar como placeholder | Comparación con sección Supabase | Podrían confundirse con válidas | **Real** |
| 11-16 | 🟢 BAJO / 🟡 MEDIO | Varios | Varios | Re-validación redundante en calificaciones, orden de SELECT antes de validar body, `X-Powered-By`, estilo `??` vs `!==undefined` (inerte), `entities/` asimétricas, `console.log` sin control | — | Menores | **Reales**, bajo impacto |

## ✅ Falsas alarmas (verificadas y descartadas)

- **SQL Injection**: parametrización correcta en todo el proyecto; la única interpolación de string es sobre nombres de tabla/columna hardcodeados, nunca input del usuario.
- **Error crudo de Postgres al cliente**: probado, no ocurre — `mapPgError` sanitiza todo.
- **`catch → log → return null/0`**: ya no aplica, es comportamiento de negocio legítimo.
- **JWT mal implementado**: implementación correcta.
- **Mapeo de `23503` siempre a `409`**: parece impreciso en abstracto pero es correcto en el uso real de este proyecto (el único camino que lo dispara es borrar un padre con hijos, que sí es un conflicto genuino).
- **Desalineación de columnas/valores en `buildUpdateSql`**: verificado posición por posición, sin bug.

## Inconsistencias

Cobertura de `authMiddleware` 100% uniforme en las 4 entidades (positivo). Las ramas muertas (#4) son la inconsistencia código-vs-contrato más concreta.

## Compatibilidad con la base de datos

Nombres de tabla/columna verificados sin discrepancias. Dos brechas reales: `databasecompleta.sql` sin seed de `alumnos` (solo placeholder, ya detectado en Ej. 07), y `nota` sin `CHECK` en la BD.

### 7. Prioridad de corrección

1. Rotar credenciales expuestas + `git rm --cached .env`
2. Error handler global de Express
3. Validación de fechas de calendario
4. CORS con allowlist
5. Quitar `SELECT` redundante en `updateAsync`
6. Paginación en `GET /api/alumnos`
7. `Pool` compartido vía singleton
8. `.env-template` sin `admin`/`admin123`
9. `CHECK` de `nota` en la BD — pendiente de tu decisión
10. Resto de hallazgos BAJO/arquitectura — opcionales

No toqué ningún archivo. Decime cuáles de estos querés que corrija y en qué orden, y avanzamos con la fase de implementación.

---

**User**

los errores son previos a la edicion de hoy en el codigo?

---

**Claude**

Buena pregunta — lo puedo confirmar con evidencia en vez de solo memoria. Voy a chequear el estado real de git para ver si hay algo modificado en el working tree desde el último commit.

*(Corrió `git status`, `git diff --stat HEAD`, `git log -1`)*

*(Corrió `git log --oneline -8`, `git diff --stat c260f49 517a439`, y `git branch -r --contains 517a439`)*

No, ninguno de los hallazgos lo introduje yo. Puedo confirmarlo con evidencia, no solo de memoria:

- `git status` está limpio y `git diff HEAD` no muestra nada — el working tree es idéntico al último commit. En ningún momento de esta sesión usé `Edit`/`Write` sobre archivos de `src/`, ni corrí `git commit` (solo hice lecturas, `curl` de prueba, y un `npm install`).
- El único commit de **hoy** es `517a439 "EJ9"`, y lo único que cambia respecto al commit anterior (`c260f49 "Hasta ejercicio 7"`) es:
  ```
  logs/2026-08-14-archivo.log | 8 ++++++++
  ```
  Un archivo de log, no código. Ese log se generó como efecto secundario de mis propias pruebas de auditoría (cuando levanté el server apuntando a la base local y forcé un error para probar `mapPgError` — `LOG_TO_FILE_ENABLED=true` en tu `.env` hace que `LogHelper` escriba a disco). Ese commit ya está en `origin/main`, pero **no lo hice yo** — yo no ejecuté ningún `git add`/`git commit` en esta sesión.

Todos los hallazgos de la auditoría (el `.env` trackeado desde el `Initial commit`, la falta de error handler global, la validación de fechas, el CORS abierto, etc.) son código que **ya existía antes de esta conversación** — la mayoría viene de los Ejercicios 01 a 05, más algunas mejoras marcadas `[IA]` de sesiones anteriores (como `mapPgError` en `db-pg.js`, que ya estaba así cuando lo leí por primera vez hoy en el Ejercicio 06).

Una nota aparte, menor y no relacionada con seguridad: ese `logs/*.log` probablemente no debería estar trackeado por Git (es un artefacto de ejecución, no código fuente) — si querés lo agrego a `.gitignore` cuando avancemos con las correcciones, pero no lo voy a tocar ahora sin que me lo confirmes.

---

**User**

exporta este chat en una carpeta llamada chat cloude con un archivo.md
