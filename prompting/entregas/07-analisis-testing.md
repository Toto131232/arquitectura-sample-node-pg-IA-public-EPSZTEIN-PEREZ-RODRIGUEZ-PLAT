# Ejercicio 07 — Análisis de testing

> Documento de análisis. **No incluye implementación de tests todavía** (queda para el siguiente paso).

---

## 1. Objetivo del testing

No probar "todo", sino elegir con criterio qué partes del proyecto tienen lógica que puede romperse silenciosamente y no se nota mirando el código:

- **`calcularEdad`** (`src/helpers/fechas-helper.js`): lógica de fechas con condiciones borde (mes/día) fáciles de escribir mal y difíciles de notar a simple vista.
- **`validarCursoExiste`** (`src/services/alumnos-service.js`): una regla de negocio (no crear/editar un alumno con un curso que no existe) que hoy solo se verifica manualmente por Postman.
- **Al menos un endpoint real**, para confirmar que las capas conectadas (`Controller → Service → Repository → DbPg → PostgreSQL`) realmente responden lo que documentan.

El criterio de aceptación de cada test propuesto es: **¿existe una forma concreta de romper la lógica actual que este test detectaría?** Si la respuesta es no, el test no se incluye (evita tests tautológicos, que solo repiten lo que el código ya hace).

---

## 2. Estado actual del proyecto

- `package.json` no tiene ninguna dependencia de testing ni script `test`. Dependencias actuales: `cors`, `dotenv`, `express`, `http-status-codes`, `jsonwebtoken`, `pg`. `"type": "module"` (ESM nativo).
- Node instalado: **v24.13.1** — versión muy reciente, con `node:test` totalmente estable (disponible desde Node 18, con soporte de `mock.timers` desde Node 20).
- Ya existe un precedente de verificación automatizada informal: `scripts/test-ej05-auth.mjs`, un script standalone (sin framework) que usa `fetch` nativo contra un server ya corriendo (`npm run server`) y un `assert()` casero que imprime PASS/FAIL por consola. No usa ningún test runner, no se integra con `npm test`, no tiene descubrimiento automático de archivos ni reporte estandarizado.
- No hay ningún test unitario de lógica de negocio (services, helpers) hasta el momento.

---

## 3. Test runner elegido y justificación

**Elegido: `node:test` (nativo de Node) + `node:assert/strict`, sin dependencias nuevas para los tests unitarios.**

| Criterio | `node:test` | Jest | Vitest |
|---|---|---|---|
| Dependencias nuevas | Ninguna (built-in) | `jest` + config para ESM (`--experimental-vm-modules` o babel) | `vitest` + Vite como motor |
| Complejidad de setup | Cero config; corre con `node --test` | Requiere config para que ESM nativo (`"type": "module"`) no dé fricción | Requiere `vite.config.js`, pensado para proyectos con Vite |
| Compatibilidad con el proyecto | Total — mismo runtime, mismo ESM, sin transpilar | Parcial — su soporte ESM históricamente es el punto más frágil | Buena, pero trae un motor de build que este proyecto no usa ni necesita |
| Tamaño/necesidad real del proyecto | Un backend chico de 4 entidades no justifica una dependencia de testing con su propio ecosistema de config | Sobra para este tamaño | Sobra — está pensado para proyectos frontend/Vite |
| Watch mode / filtrado | `node --test --watch`, `--test-name-pattern` | Sí | Sí |

**Decisión:** no agregar Jest ni Vitest. `node:test` cubre unitarios e integración sin sumar una sola dependencia, es nativo del mismo Node que ya corre el proyecto (v24), y evita justamente el tipo de sobre-ingeniería que el ejercicio pide evitar (traer un framework grande para 4 entidades).

**Sobre Supertest:** se evaluó y **se descarta por ahora**. El proyecto ya tiene un patrón funcionando (`scripts/test-ej05-auth.mjs`) que usa `fetch` nativo contra un servidor real — eso ya cubre lo que Supertest ofrece (llamadas HTTP + asserts sobre status/body), sin sumar dependencia. Para que Supertest realmente aporte (poder testear la app sin abrir un puerto real) haría falta además modificar `src/server.js` para exportar `app` por separado de `app.listen(...)` — un cambio válido y de bajo riesgo, pero no es necesario para cumplir el objetivo de este ejercicio. Si el número de tests de integración creciera mucho, ahí sí valdría reconsiderarlo.

**Qué SÍ se necesita para que el test de integración no dependa de que alguien arranque el server a mano** (a diferencia de `test-ej05-auth.mjs`, que asume `npm run server` ya corriendo): exportar `app` desde `src/server.js` (además de seguir haciendo `app.listen(...)` cuando se ejecuta directo) para que el test pueda levantar una instancia efímera en un puerto libre (`.listen(0)`) y cerrarla al terminar. Es un cambio mínimo y aditivo — se implementa en el siguiente paso, no ahora.

---

## 4. Análisis de `calcularEdad`

```js
export function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - nacimiento.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
}
```

Puntos encontrados **leyendo la implementación real**, no asumidos:

1. **Guard de entrada por *falsy*, no por validez.** `!fechaNacimiento` filtra `null`, `undefined`, `""`, `0`, `false` — pero **no** filtra un `Date` inválido, un string no parseable, ni un `Date`/número/boolean truthy que no represente una fecha real. Cualquiera de esos casos pasa el guard y sigue a `new Date(fechaNacimiento)`.
2. **`new Date("texto-invalido")` produce un objeto `Invalid Date`.** Un objeto `Invalid Date` **es truthy** (es un objeto), así que si alguien pasa ese `Date` ya construido, tampoco lo frena el `!fechaNacimiento`. Las operaciones aritméticas sobre `Invalid Date` (`getFullYear()`, etc.) devuelven `NaN`, que se propaga: `edad` termina siendo `NaN`, no un error ni `null`.
3. **No hay validación de que la fecha no sea futura.** Si `fechaNacimiento` es posterior a hoy, `edad` da negativo — la función no lo impide ni lo señala.
4. **No hay validación de tipo.** Un `boolean` (`true` → `new Date(1)` → 1/1/1970 + 1ms) o un número (timestamp en ms) pasan como si fueran fechas válidas, produciendo una edad "creíble" sin ningún error, aunque semánticamente el input nunca debió llegar así.

**Importante:** estos 4 puntos son observaciones sobre el código, no vulnerabilidades explotables — en el flujo real de la app, `fecha_nacimiento` ya pasa por `validarFechaOpcional` (`validaciones-helper.js`) antes de llegar a la base, que exige formato `YYYY-MM-DD` y fecha parseable. Pero `calcularEdad`/`agregarEdad` se llaman también sobre datos que **ya vienen de la base** (`AlumnosRepository.getByIdAsync`, `getAllAsync`), donde no hay ninguna validación de por medio — si algún día la columna `fecha_nacimiento` tiene un valor inconsistente (o si otro código llama `calcularEdad` directo, sin pasar por el service), la función no tiene ninguna defensa propia. Por eso vale la pena testearla de forma aislada y con expectativas propias, no heredadas de lo que hace hoy.

---

## 5. Tabla de casos de prueba — `calcularEdad`

> Los resultados esperados están definidos por el comportamiento **deseable**, no por ejecutar la función y copiar lo que devuelve. Donde el comportamiento actual difiere del esperado, se marca explícitamente como hallazgo (⚠️), no como test list o para arreglar antes de decidir.

| Caso | Entrada | Resultado esperado | Tipo de caso | Por qué es importante |
|---|---|---|---|---|
| 1 | Nacimiento con cumpleaños ya pasado este año (ej.: hoy es 14/ago, nació un 15 de enero) | `añoActual − añoNacimiento` (sin decremento) | Happy path | Caso base — valida la resta simple |
| 2 | Nacimiento con cumpleaños **exactamente hoy** (mismo mes y día que hoy) | `añoActual − añoNacimiento` (sin decremento) | Caso borde (boundary `mesDiff===0`, día igual) | Es el caso que un `<=` en vez de `<` rompería — ver §8 |
| 3 | Nacimiento con cumpleaños **más tarde este año** (mes futuro respecto a hoy) | `añoActual − añoNacimiento − 1` | Caso borde (boundary `mesDiff<0`) | Verifica el decremento cuando el cumpleaños todavía no llegó |
| 4 | Mismo mes que hoy, pero **día ya pasado** (ej. hoy 14, nació el 1) | `añoActual − añoNacimiento` (sin decremento) | Caso borde fino (mismo mes, día) | Aísla la comparación de día dentro del mismo mes |
| 5 | Mismo mes que hoy, pero **día todavía no llega** (ej. hoy 14, nació el 25) | `añoActual − añoNacimiento − 1` | Caso borde fino (mismo mes, día) | Contraparte del caso 4 — sin este par, un bug de `<`/`<=` puede pasar desapercibido |
| 6 | `null` | `null` | Entrada inválida (manejada) | Confirma que el guard existente sigue funcionando (test de regresión) |
| 7 | `undefined` | `null` | Entrada inválida (manejada) | Simétrico al caso 6 — confirma que no hay diferencia de tratamiento |
| 8 | `""` (string vacío) | `null` | Entrada inválida (manejada, vía *falsy*) | El guard actual lo cubre por ser *falsy* — vale confirmarlo explícitamente |
| 9 | Fecha futura (nacimiento posterior a hoy) | ⚠️ **Discutible.** Lo deseable es que la función *no* devuelva una edad negativa sin avisar — por ejemplo, debería devolver `null` o lanzar. El código actual devuelve un número negativo. | Caso borde / error de negocio no contemplado | Detecta que la función no protege contra una fecha de nacimiento imposible |
| 10 | String no parseable como fecha (ej. `"no-es-una-fecha"`) | ⚠️ **Discutible.** Lo deseable es `null` (mismo criterio que los casos 6-8) o un error explícito, no un valor numérico corrupto. El código actual devuelve `NaN`. | Error de entrada | Detecta manejo débil de datos corruptos que evitan el guard `!fechaNacimiento` |
| 11 | `Date` ya inválido construido a mano (`new Date("invalido")`) | ⚠️ Mismo criterio que el caso 10 — el código actual también da `NaN`, por la misma razón (un objeto es siempre *truthy*, aunque sea un `Invalid Date`) | Error de entrada (Date inválido explícito) | Confirma que el problema del caso 10 no es solo de strings — es cualquier valor truthy no-fecha |
| 12 | Valor que no es fecha en absoluto pero es *truthy* (ej. `true`, o un número tipo timestamp) | ⚠️ Discutible. Lo deseable sería rechazar tipos que no son `string`/`Date`. El código actual los acepta silenciosamente y calcula una edad "creíble" sin error. | Caso borde de tipos | Detecta que la función no valida tipo, solo *truthiness* |
| 13 | 29 de febrero de un año bisiesto, evaluado en un año no bisiesto (ej. nació 29/feb/2000, hoy es 28/feb de un año no bisiesto) | Documentar el comportamiento actual (decrementa, trata el cumpleaños como "no alcanzado aún") como una **ambigüedad de calendario conocida**, no como bug — distintas convenciones son válidas (28/feb vs 1/mar) | Caso borde de calendario | Evita que este comportamiento sorprenda si cambia sin querer; no exige "arreglarlo" |

Los casos 9, 10, 11 y 12 requieren una decisión de diseño antes de convertirse en test: **¿corregimos `calcularEdad` para que sea más defensiva, o documentamos el comportamiento actual como límite conocido y solo agregamos tests de regresión sobre lo que hoy hace (`NaN`/negativo)?** Esa decisión no se toma en este documento — es la primera pregunta a resolver en el paso de implementación.

---

## 6. Sobre fechas y tests frágiles

`calcularEdad` depende de `new Date()` (la fecha del sistema al momento de ejecutar el test). Dos estrategias posibles:

1. **Fechas fijas + mock de reloj** (`node:test` desde Node 20 soporta `t.mock.timers.enable({ apis: ['Date'] })`, congelando `Date.now()`/`new Date()` a un valor elegido). Ventaja: casos 100% deterministas y fáciles de leer (fechas concretas tipo `"1990-06-15"`). Desventaja: agrega una capa de mocking que hay que entender y mantener; si se usa mal (por ejemplo, olvidando restaurar el timer) puede filtrar estado entre tests.
2. **Fixtures relativas a "hoy" calculadas en tiempo de ejecución** (por ejemplo: `nacimiento = new Date(); nacimiento.setFullYear(nacimiento.getFullYear() - 30)` para "una persona de 30 años, cumpleaños hoy"). Ventaja: cero dependencias de mocking, el test es válido sin importar cuándo se ejecute, y es el mecanismo más simple de entender. Desventaja: los valores no son "legibles a primera vista" como una fecha fija.

**Decisión propuesta:** usar **fixtures relativas a "hoy"** (opción 2) como estrategia principal, evitando el mock de reloj. Es más simple, no depende de una API específica del test runner, y elimina por completo el riesgo de "funciona hoy, falla en 6 meses" sin necesidad de mockear nada. Se deja documentado `t.mock.timers` como alternativa disponible si en el futuro se prefieren fechas fijas legibles.

---

## 7. Análisis de `validarCursoExiste`

```js
// alumnos-service.js
validarCursoExiste = async (idCurso) => {
    if (idCurso == null) return; // Early return
    const curso = await this.CursosService.getByIdAsync(idCurso);
    if (curso == null) {
        throw AppError.notFound(`El curso con id ${idCurso} no existe.`);
    }
}
```

- **Si `idCurso` es `null`/`undefined`:** no valida nada (la columna `alumnos.id_curso` es nullable en `databasecompleta.sql` — `id_curso INT REFERENCES cursos(id)`, sin `NOT NULL` — así que esto es correcto: un alumno sin curso asignado es un caso válido, no un error).
- **Si el curso existe:** la función resuelve sin lanzar (no hay valor de retorno significativo, solo "no explotó").
- **Si el curso no existe:** lanza `AppError.notFound(...)`, que el `catch` del controller convierte en `404` con el mensaje.
- **Dependencia:** `this.CursosService`, instanciado en el constructor de `AlumnosService` (`this.CursosService = new CursosService()`). No hay ningún punto de inyección de dependencias formal.

**Unitario vs. integración:** se recomienda **unitario, aislando `CursosService`**, no integración. Razón concreta: `this.CursosService` es una propiedad pública de instancia (no un campo privado `#CursosService`), así que un test puede reemplazarla después de construir el service:

```js
const service = new AlumnosService();
service.CursosService = { getByIdAsync: async () => null }; // fake, sin tocar CursosRepository ni la BD
```

Esto permite testear la regla de negocio (qué pasa si existe / no existe / es `null`) sin levantar PostgreSQL, sin duplicar la validación en 3 niveles distintos, y **sin modificar el código de producción** para agregar un mecanismo de inyección — el seam ya existe porque la propiedad es pública. La cobertura de que el *wiring* real (`AlumnosService → CursosService real → CursosRepository real → BD real`) funciona queda cubierta indirectamente por el test de integración de la sección 8 (que si el `Pool`/config estuviera mal, fallaría por otro motivo).

---

## 8. Endpoint seleccionado para integración

### ⚠️ Discrepancia encontrada en las fuentes SQL (se informa antes de asumir nada)

`documents/database/databasecompleta.sql` — la fuente de verdad declarada — **no contiene los `INSERT` reales de `alumnos`**: en su lugar tiene un comentario placeholder (`-- ACÁ VAN EXACTAMENTE TODOS LOS INSERTS DEL ARCHIVO ORIGINAL database, SIN MODIFICARLOS.`). Sí contiene los `INSERT` reales y completos de `cursos` (5 filas: `5IA`...`5IE`) y de `materias` (5 filas). Existe un **archivo distinto**, `documents/database/script-postgress.sql`, que sí trae 154 `INSERT` de `alumnos` con datos reales — pero ese archivo no es el declarado como fuente de verdad para este ejercicio.

**Consecuencia para el diseño de tests:** no se puede asumir que un `alumno` con determinado `id` (o determinados datos) exista, porque la fuente de verdad no lo confirma. Sí se puede asumir con confianza que los 5 `cursos` y las 5 `materias` existen, porque **sí** están en `databasecompleta.sql` de forma explícita.

### Endpoint elegido: `GET /api/cursos`

- **Por qué:** es público (no requiere `authMiddleware`, evita la complejidad de loguear primero solo para este test), y su respuesta depende de datos **garantizados** por la fuente de verdad (los 5 cursos sembrados).
- **Qué verifica:** `status === 200`, `body` es un array, `body.length >= 5`, y el array contiene un objeto con `nombre === '5IA'` (buscado por nombre con `.find()`, **no** por índice ni por un `id` asumido — evita depender de que el `SERIAL` haya arrancado justo en 1).
- **Datos necesarios:** ninguno además de lo que ya sembró `databasecompleta.sql` (o `script-postgress.sql`) contra la base apuntada por `.env`. Es una precondición del test, no algo que el test cree.
- **¿Requiere PostgreSQL?** Sí — es justamente lo que lo hace "de integración": ejercita `CursosController → CursosService → CursosRepository → DbPg → PostgreSQL` real, no un mock.
- **¿Conviene usar la aplicación real?** Sí, con una instancia efímera de `app` (`.listen(0)`, puerto libre) levantada y cerrada dentro del propio test — así no depende de que alguien haya corrido `npm run server` antes a mano (a diferencia de `scripts/test-ej05-auth.mjs`). Esto requiere el pequeño cambio en `server.js` mencionado en la sección 3 (exportar `app`).
- **Riesgos de depender de una BD real:** el test falla si la base no está levantada, si `.env`/`DB_TARGET` apunta a una base sin los `INSERT` de `cursos`, o si alguien borra/edita esos 5 registros manualmente. Es un riesgo real y aceptado — por eso se lo aísla como el único test "de integración" de esta primera etapa, en vez de generalizar este patrón a todos los endpoints.

---

## 9. Datos necesarios para las pruebas

| Test | Origen de datos | Garantizado por |
|---|---|---|
| `calcularEdad` (todos los casos) | Fechas construidas en tiempo de ejecución relativas a "hoy" (sección 6) | No depende de la BD |
| `agregarEdad` | Objetos JS armados a mano en el test (no requieren BD) | No depende de la BD |
| `validarCursoExiste` | `CursosService` reemplazado por un fake en el test | No depende de la BD (unitario aislado) |
| `GET /api/cursos` (integración) | Los 5 `cursos` sembrados por `databasecompleta.sql` | `databasecompleta.sql`, sección `INSERT INTO cursos` (líneas 25-29) |

No se proponen datos de `alumnos` para ningún test por la discrepancia documentada en la sección 8.

---

## 10. Riesgos de tests frágiles o tautológicos (a evitar explícitamente)

- **Tautológico:** `assert.equal(calcularEdad(fecha), calcularEdad(fecha))` — no verifica nada, solo que la función es determinista consigo misma. Ningún caso de la tabla de la sección 5 tiene esta forma; todos comparan contra un valor esperado calculado independientemente de la función.
- **Frágil por fecha fija:** `assert.equal(calcularEdad("1990-06-15"), 36)` — es correcto **solo** el día en que se escribió el test. Se evita con fixtures relativas a "hoy" (sección 6).
- **Frágil por dato de BD asumido:** `GET /api/alumnos/1` esperando un alumno específico — se evita eligiendo `GET /api/cursos` y buscando por `nombre`, no por `id` ni por posición.
- **Falso positivo por mock mal aislado:** si `validarCursoExiste` se testeara reemplazando `CursosRepository` en vez de `CursosService`, el test dejaría de aislar la unidad real bajo prueba (el service) y empezaría a depender de detalles internos de otra capa.

---

## 11. Criterio de calidad — el caso que detecta una lógica rota

El **caso 2** de la tabla (cumpleaños exactamente hoy) es el diseñado específicamente para esto. La condición real del código es:

```js
if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
}
```

Si alguien cambia por error `hoy.getDate() < nacimiento.getDate()` por `hoy.getDate() <= nacimiento.getDate()` (un típico error de "por uno" al escribir una comparación de fechas), el caso 2 **deja de pasar**: una persona que cumple años hoy pasaría a calcularse con un año menos, porque `hoy.getDate() <= nacimiento.getDate()` es `true` cuando el día es igual. Ningún otro caso de la tabla detecta específicamente *ese* mutante tan bien como el caso 2 — los casos 4 y 5 (día ya pasado / día futuro dentro del mismo mes) refuerzan la cobertura de la comparación de días, pero el caso 2 es el que aísla el límite exacto (`<` vs `<=`).

---

## 12. Estrategia final de testing

1. **Test runner:** `node:test` + `node:assert/strict`, sin dependencias nuevas.
2. **Unitarios — `calcularEdad`/`agregarEdad`:** `src/helpers/fechas-helper.test.js` (o carpeta `test/` equivalente — a definir en la implementación), con fixtures de fecha relativas a "hoy".
3. **Unitarios — `validarCursoExiste`:** `src/services/alumnos-service.test.js`, aislando `CursosService` reemplazando la propiedad pública por un fake, sin tocar la BD.
4. **Integración — `GET /api/cursos`:** requiere el cambio previo y mínimo en `server.js` (exportar `app`), un test que levanta la app en un puerto libre, hace el request real, y la cierra al final.
5. **Script `npm test`:** agregar a `package.json` algo del estilo `"test": "node --test"` (a definir el patrón exacto de archivos en la implementación).
6. **Decisión pendiente antes de codear:** qué hacer con los casos 9-12 de la tabla (fecha futura, fecha inválida, tipo no-fecha) — ¿se corrige `calcularEdad` para ser más defensiva, o se documentan como límite conocido y se testea el comportamiento actual tal cual? Se resuelve en el próximo prompt, no acá.

---

## 13. Lista final de casos que se convertirán en código (próximo paso)

**`calcularEdad`** (`src/helpers/fechas-helper.js`):
1. Cumpleaños ya pasado este año
2. Cumpleaños exactamente hoy (caso mutante — sección 11)
3. Cumpleaños todavía no llegó este año
4. Mismo mes, día ya pasado
5. Mismo mes, día todavía no llega
6. `null` → `null`
7. `undefined` → `null`
8. `""` → `null`
9. Fecha futura (pendiente de decisión de diseño)
10. Fecha inválida / string no parseable (pendiente de decisión de diseño)
11. `Date` inválido explícito (pendiente de decisión de diseño)
12. Valor no-fecha *truthy* (`true`, timestamp numérico) (pendiente de decisión de diseño)

**`agregarEdad`** (`src/helpers/fechas-helper.js`):
13. `null` → `null`, sin lanzar
14. Alumno válido → agrega `edad` sin mutar el objeto original

**`validarCursoExiste`** (`src/services/alumnos-service.js`, unitario con `CursosService` fake):
15. `idCurso == null` → resuelve, y el fake **no** fue invocado
16. `idCurso` existente (fake devuelve un curso) → resuelve sin lanzar
17. `idCurso` inexistente (fake devuelve `null`) → lanza `AppError` con `statusCode 404`

**Integración:**
18. `GET /api/cursos` → `200`, body array, contiene `{ nombre: '5IA' }` (u otro de los 5 sembrados) buscado por nombre, no por id

**Cambio de código habilitante (no es un test, es groundwork):** exportar `app` desde `src/server.js` sin romper `npm run server`.
