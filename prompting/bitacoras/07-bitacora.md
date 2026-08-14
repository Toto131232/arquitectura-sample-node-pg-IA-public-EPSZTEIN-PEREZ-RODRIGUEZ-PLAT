# 📓 Bitácora de Prompts — Ejercicio N° 07

> Basada en `prompting/PLANTILLA - Bitacora de prompts y entrega.md`

---

## Datos

- **Alumno/a:** [YO] Completar
- **Ejercicio:** N° 07 — Testing
- **Fecha:** 2026-08-14
- **Modelo de IA usado:** Claude Code (Sonnet 5)

---

## 1. 🎯 Qué me pidieron

Antes de escribir un solo test, auditar el proyecto y diseñar una estrategia de testing: elegir un test runner sin sumar dependencias innecesarias, diseñar casos de prueba para `calcularEdad` distinguiendo happy path / casos borde / errores de entrada (sin copiar el comportamiento actual como si fuera correcto), analizar cómo testear `validarCursoExiste`, y elegir un endpoint para un test de integración basado en datos reales de `databasecompleta.sql`.

```
El objetivo de esta etapa es diseñar la estrategia y los casos de prueba,
no implementar tests todavía. La implementación queda para el siguiente prompt.
```

---

## 2. 💬 Mis prompts (en orden)

### Prompt #1 — Auditoría y diseño de testing (sin código)

**Lo que escribí:**
```
Actuá como ingeniero de software senior especializado en testing de
Node.js/Express. Revisá src/, package.json, calcularEdad, validarCursoExiste,
controllers/repositories de alumnos, server-capas-explicacion.md y
databasecompleta.sql (fuente de verdad de la BD). Diseñá una tabla de casos
de prueba para calcularEdad sin copiar el comportamiento actual como
expectativa. Analizá si validarCursoExiste conviene testearlo unitario o
por integración. Elegí un endpoint de integración basado en datos reales
de la BD, sin inventar IDs. Elegí un test runner (node:test / Jest / Vitest
/ Supertest) justificando la elección, sin agregar dependencias innecesarias.
No implementes tests todavía. Documentá en prompting/entregas/07-analisis-testing.md
y la bitácora del ejercicio respetando la plantilla existente.
```

**Auto-chequeo de las 5 partes EFSI:**
- [x] Rol
- [x] Contexto (se apuntó a los archivos/carpetas fuente obligatorios)
- [x] Tarea
- [x] Restricciones (no BD, no dependencias innecesarias, no implementar aún, no tautológico)
- [x] Iteración (pedido explícito de no copiar comportamiento actual como expectativa correcta)

**Qué me devolvió (resumen):**
```
Al revisar node --version (v24.13.1) y package.json (sin devDependencies de
testing), se justificó node:test + node:assert/strict sin sumar dependencias,
descartando Jest/Vitest por sobre-ingeniería para el tamaño del proyecto, y
descartando Supertest por ahora porque el proyecto ya tiene un patrón
funcionando con fetch nativo (scripts/test-ej05-auth.mjs) que cubre lo mismo.

En calcularEdad se identificaron 4 puntos reales del código (no genéricos):
el guard es por *falsy*, no por validez; un Invalid Date es truthy y produce
NaN silencioso; no hay protección contra fecha de nacimiento futura; no hay
validación de tipo (booleans/números pasan como fecha válida). Se armó una
tabla de 13 casos, marcando explícitamente como "discutible" (⚠️) los casos
donde el resultado esperado NO coincide con lo que la función hace hoy
(fecha inválida, fecha futura, tipo no-fecha) en vez de asumir que el
comportamiento actual es el correcto.

Para validarCursoExiste se recomendó test unitario, aislando CursosService
reemplazando la propiedad pública `service.CursosService` por un fake — sin
modificar código de producción para agregar inyección de dependencias,
porque el seam ya existe (la propiedad no es privada).

Al revisar documents/database/databasecompleta.sql se encontró que NO
contiene los INSERT reales de alumnos (solo un comentario placeholder),
mientras que un archivo distinto, script-postgress.sql, sí los tiene (154
filas). Como databasecompleta.sql es la fuente de verdad declarada y no
confirma datos de alumnos, se descartó cualquier test de integración sobre
/api/alumnos con IDs asumidos, y se eligió GET /api/cursos (con los 5
cursos que SÍ están confirmados en databasecompleta.sql), buscando por
nombre en vez de por id.
```

**¿Me sirvió tal cual, o tuve que corregir/repreguntar?**
```
Sirvió tal cual para esta etapa. No hizo falta un segundo prompt porque se
pidió explícitamente verificar el SQL antes de asumir datos de prueba, lo
que evitó que el análisis propusiera un test de integración sobre /api/alumnos
con datos que en realidad no están garantizados por la fuente de verdad.
```

---

## 3. 🔧 Qué hizo la IA y qué hice yo

| Archivo / función | Lo generó la IA | Lo modifiqué/escribí yo | Por qué |
|---|---|---|---|
| `prompting/entregas/07-analisis-testing.md` | Sí | Pendiente revisión | Documento de análisis completo (runner, tabla de casos, endpoint de integración, estrategia) |
| `prompting/bitacoras/07-bitacora.md` | Sí (estructura y contenido) | [YO] Completar datos personales y reflexión final | Sigue la plantilla existente del TP |

No se modificó ningún archivo de `src/`, `package.json` ni SQL en esta etapa — solo lectura y análisis.

---

## 4. 🐛 Errores o cosas mal que detecté en la respuesta de la IA

```
1. Al principio se podría haber elegido /api/alumnos/:id como endpoint de
   integración por ser "el más natural" (es la entidad con más lógica de
   negocio). Se descartó explícitamente al confirmar que databasecompleta.sql
   no trae datos reales de alumnos (solo un placeholder) — usar ese endpoint
   hubiera significado inventar un id que no está garantizado por la fuente
   de verdad, justo lo que la consigna prohíbe.

2. Se consideró proponer Supertest de entrada "porque es lo estándar para
   testing HTTP en Node", pero al revisar que el proyecto ya tiene un patrón
   de integración con fetch nativo funcionando (test-ej05-auth.mjs) y que
   sumar Supertest no aporta nada que fetch no cubra ya, se lo dejó afuera
   por ahora — coincide con la regla de "no agregar dependencias si no son
   necesarias".

3. Para los casos borde de calcularEdad con fecha inválida/futura/no-fecha,
   se evitó el error de "ejecutar la función y copiar el resultado como
   expectativa" (ej. asumir que NaN es el resultado correcto). Se los dejó
   marcados como comportamiento discutible pendiente de decisión, en vez de
   fijar una expectativa sin haberlo consultado primero.
```

---

## 5. ✅ Verificación

```
- [x] La tabla de casos de calcularEdad no es tautológica: cada resultado
      esperado está definido independientemente de ejecutar la función.
- [x] Se identificó al menos un caso (cumpleaños exactamente hoy) que
      detectaría un cambio intencional de lógica (< por <=), tal como pide
      la consigna.
- [x] Se analizó la estrategia de testing de validarCursoExiste (unitario
      con fake) sin necesidad de modificar código de producción.
- [x] Se seleccionó un endpoint de integración (GET /api/cursos) basado en
      datos confirmados por databasecompleta.sql, sin inventar IDs.
- [x] Se verificó documents/database/databasecompleta.sql antes de proponer
      cualquier dato de prueba, y se documentó la discrepancia encontrada
      entre ese archivo y script-postgress.sql respecto a los datos de
      alumnos.
- [x] No se implementó ningún test todavía — pendiente para el siguiente paso.
- [ ] [YO] Revisar el documento y decidir qué hacer con los casos 9-12 de
      calcularEdad (fecha futura/inválida/no-fecha) antes de implementar.
```

---

## 6. ✍️ Reflexión (300–600 palabras)

[YO] Completar con tus palabras. Borrador base:

**¿Con qué propuesta de la IA no estuviste de acuerdo, y por qué?**
[YO] Completar tras revisar el análisis — pensar especialmente si estás de
acuerdo con dejar los casos 9-12 de calcularEdad como "pendiente de decisión"
en vez de que la IA decidiera directamente corregir la función.

**¿Por qué elegiste `node:test` en vez de Jest?**
[YO] Completar: pensar en términos de qué hubiera pasado si el proyecto ya
tuviera decenas de archivos de test y necesitara mocking más sofisticado —
¿seguiría siendo la elección correcta?

**¿Qué aprendiste sobre la diferencia entre un test tautológico y uno real?**
[YO] Completar: usar el ejemplo de `calcularEdad(fecha) === calcularEdad(fecha)`
frente a los casos reales de la tabla.

**¿Qué fue lo más sorprendente del análisis?**
[YO] Completar: probablemente la discrepancia entre `databasecompleta.sql`
(placeholder de alumnos) y `script-postgress.sql` (154 filas reales), y cómo
eso cambió la elección del endpoint de integración.

---

## 7. Decisiones de diseño registradas

| Tema | Decisión |
|---|---|
| Alcance de esta etapa | Solo análisis y diseño de casos — sin implementar tests |
| Test runner | `node:test` + `node:assert/strict`, sin dependencias nuevas |
| Supertest | Descartado por ahora; se evalúa si crece la cantidad de tests de integración |
| Estrategia de fechas | Fixtures relativas a "hoy" calculadas en tiempo de ejecución, no fechas fijas ni mock de reloj |
| `validarCursoExiste` | Test unitario, reemplazando `service.CursosService` por un fake (seam ya existe, sin tocar producción) |
| Endpoint de integración elegido | `GET /api/cursos` (datos confirmados por `databasecompleta.sql`, búsqueda por `nombre` no por `id`) |
| Endpoint descartado | Cualquiera de `/api/alumnos` — la fuente de verdad no confirma datos de alumnos |
| Discrepancia documentada | `databasecompleta.sql` no trae `INSERT` reales de `alumnos` (solo placeholder); `script-postgress.sql` sí los trae, pero no es la fuente de verdad declarada |
| Cambio habilitante pendiente (no es test) | Exportar `app` desde `src/server.js` para poder levantar una instancia efímera en el test de integración |
| BD | **Sin cambios** en `databasecompleta.sql` ni en ningún otro script SQL |

---

## 8. 🔗 Adjuntos

- [ ] Link/PDF de la conversación completa con la IA
- [ ] Commit(s) en GitHub: `[YO] Completar`
- [ ] Capturas / evidencias de verificación
