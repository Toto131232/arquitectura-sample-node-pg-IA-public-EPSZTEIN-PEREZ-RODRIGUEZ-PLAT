# 📓 Bitácora de Prompts — Ejercicio N° 06

> Basada en `prompting/PLANTILLA - Bitacora de prompts y entrega.md`

---

## Datos

- **Alumno/a:** [YO] Completar
- **Ejercicio:** N° 06 — Arquitectura de la aplicación
- **Fecha:** 2026-08-14
- **Modelo de IA usado:** Claude Code (Sonnet 5)

---

## 1. 🎯 Qué me pidieron

Usar la IA como consultor de arquitectura (no como generador de código) para auditar críticamente la arquitectura en capas del proyecto (`Controller → Service → Repository → DbPg → PostgreSQL`), detectar entre 3 y 5 problemas o decisiones discutibles **reales** (con evidencia concreta del código, no genéricos), y entregar un documento de análisis. La implementación de la recomendación elegida queda para una etapa posterior.

```
El objetivo de esta etapa es solo analizar y documentar, no tocar código.
La recomendación final elegida debe ser acotada y proporcional al tamaño
del proyecto (nada de Clean Architecture / DDD / CQRS / DI containers).
```

---

## 2. 💬 Mis prompts (en orden)

### Prompt #1 — Auditoría de arquitectura (sin código)

**Lo que escribí:**
```
Actuá como arquitecto de software senior sobre un proyecto educativo.
Analizá críticamente src/, documents/server-capas-explicacion.md y
documents/database/databasecompleta.sql (fuente de verdad de la BD,
no modificar). Auditá: capa Service (pass-through vs con lógica),
manejo de errores de DbPg, instancias de DbPg/Pool por repository,
entities/, y console.log. Encontrá entre 3 y 5 problemas reales con
evidencia de código, no genéricos. No implementes nada todavía. Entregá
un documento en prompting/entregas/06-analisis-arquitectura.md y la
bitácora del ejercicio en prompting/bitacoras/, respetando la plantilla
existente sin inventar una nueva.
```

**Auto-chequeo de las 5 partes EFSI:**
- [x] Rol
- [x] Contexto (se apuntó a los 3 archivos/carpetas fuente obligatorios)
- [x] Tarea
- [x] Restricciones (no tocar BD, no implementar, no sobre-ingeniería, respetar plantilla)
- [x] Iteración (pedido explícito de no ser complaciente y buscar problemas reales)

**Qué me devolvió (resumen):**
```
Al leer el código encontré que un dato clave del propio enunciado del
ejercicio ya no es cierto: server-capas-explicacion.md y el enunciado
06 - Arquitectura de la aplicacion.md describen que DbPg "se traga los
errores" y devuelve null/0 siempre. El código actual de db-pg.js ya
tiene mapPgError() (marcado [IA]), que loguea con LogHelper y LANZA un
AppError tipado según el código de error de Postgres (23505, 23503,
22P02). Eso ya estaba resuelto en una iteración previa del proyecto.

En lugar de repetir ese problema como "nuevo", identifiqué 5 problemas
reales con evidencia de línea de código:
1. Multiplicación de Pool por composición de services anidados (8
   instancias de repository al arrancar, no 4, por AlumnosService
   creando su propio CursosService y CalificacionesService creando su
   propio AlumnosService + MateriasService).
2. Doble verificación de existencia en updateAsync (service Y
   repository hacen el mismo getByIdAsync).
3. Ramas `else` en los controllers que ya no son alcanzables porque el
   contrato de DbPg cambió (de retornar null/0 a lanzar AppError) pero
   los controllers no se actualizaron.
4. console.log de trazas (63 ocurrencias en 18 archivos, confirmado
   con grep) sin control por entorno, más doble logueo de errores.
5. entities/ sub-utilizadas y asimétricas (solo Alumno/Curso, no
   Materia/Calificacion).

Se generaron los dos archivos pedidos y se seleccionó el problema #1
(Pool compartido) como recomendación a implementar en el siguiente
paso, por ser la que el propio enunciado pregunta explícitamente y
la de mayor valor arquitectónico proporcional al proyecto.
```

**¿Me sirvió tal cual, o tuve que corregir/repreguntar?**
```
Sirvió tal cual para esta etapa (solo análisis, sin código). No hubo
necesidad de un segundo prompt porque se pidió explícitamente citar
evidencia de línea de código antes de escribir cualquier conclusión,
lo que evitó que la IA repitiera problemas genéricos o ya desactuales
del propio enunciado del ejercicio.
```

---

## 3. 🔧 Qué hizo la IA y qué hice yo

| Archivo / función | Lo generó la IA | Lo modifiqué/escribí yo | Por qué |
|---|---|---|---|
| `prompting/entregas/06-analisis-arquitectura.md` | Sí | Pendiente revisión | Documento de análisis completo (flujo, tabla de problemas, recomendación elegida) |
| `prompting/bitacoras/06-bitacora.md` | Sí (estructura y contenido) | [YO] Completar datos personales y reflexión final | Sigue la plantilla existente del TP |

No se modificó ningún archivo de `src/` ni de `documents/database/` en esta etapa — solo lectura y análisis.

---

## 4. 🐛 Errores o cosas mal que detecté en la respuesta de la IA

```
1. El enunciado del propio Ejercicio 06 (documents/server-capas-explicacion.md
   y prompting/06 - Arquitectura de la aplicacion.md) describe un comportamiento
   de DbPg que YA NO es el actual: dice que el catch devuelve null/0 siempre.
   El código real ya usa mapPgError() + AppError. Esto no es un error de la
   IA, sino una desactualización real de la documentación del proyecto
   respecto al código — se dejó documentado explícitamente en el análisis
   en vez de repetir el problema como si siguiera vigente.

2. El enunciado sugiere una relación simple "N entidades = N pools". El
   análisis real (siguiendo la cadena de constructors) muestra que el
   número real es mayor (8, no 4) por la composición de services que
   crean sus propias instancias de otros services. Se verificó línea por
   línea en alumnos-service.js, calificaciones-service.js y los 4
   controllers antes de afirmar el número.

3. Al principio evalué marcar "capa Service pass-through" como problema
   (así lo sugiere el enunciado), pero al revisar CursosService y
   MateriasService vi que sí validan input — no son pass-through puro.
   Decidí no incluirlo como "problema" sino como aclaración: la
   diferencia de lógica entre services es proporcional al dominio
   (cursos/materias no tienen FKs entrantes ni campos derivados), no
   una falla de diseño.
```

---

## 5. ✅ Verificación

```
- [x] El documento describe el flujo real de una request, verificado
      contra alumnos-controller.js, alumnos-service.js, alumnos-repository.js
      y db-pg.js (no inventado).
- [x] Cada problema tiene evidencia de archivo:línea real, leída del
      código del proyecto en esta sesión.
- [x] Cada recomendación tiene un trade-off explícito (qué se gana / qué
      se pierde o arriesga).
- [x] Se confirmó documents/database/databasecompleta.sql y se verificó
      que ninguna recomendación contradice nombres de tabla/columna, PKs,
      FKs ni constraints (cursos, alumnos, materias, calificaciones con
      su UNIQUE(id_alumno, id_materia)).
- [x] No se implementó código todavía — pendiente para el siguiente paso.
- [ ] [YO] Revisar el documento de análisis y confirmar que estoy de
      acuerdo con la recomendación elegida antes de pedir la implementación.
```

---

## 6. ✍️ Reflexión (300–600 palabras)

[YO] Completar con tus palabras. Borrador base:

**¿Con qué problema detectado por la IA NO estuve de acuerdo, y por qué?**
[YO] Completar tras revisar el análisis — pensar especialmente si la
recomendación del problema #3 (borrar las ramas `else` "muertas" de los
controllers) te convence tal cual, o si preferirías mantenerlas como
defensa aunque hoy no se disparen.

**¿Por qué elegiste (o no) la misma recomendación final que la IA?**
La IA priorizó el Pool compartido porque es el problema con evidencia
más fuerte (8 instancias reales, no 4) y porque es exactamente lo que
pregunta el enunciado del ejercicio. Evaluar si coincidís con esa
prioridad frente a, por ejemplo, arreglar primero el logging.

**¿Qué aprendiste sobre el patrón singleton para el `Pool` de conexiones?**
[YO] Completar: por qué un `Pool` por instancia de repository es
ineficiente aunque cada `Pool` individualmente esté bien implementado
(lazy, con try/catch, etc.) — el problema no es cómo se construye el
Pool sino cuántas veces se construye.

**¿Qué fue lo más sorprendente del análisis?**
[YO] Completar: probablemente el hecho de que el propio enunciado del
ejercicio describe un comportamiento de `DbPg` que ya no es el actual,
y que el número real de pools (8) es el doble de lo que el enunciado
sugiere.

---

## 7. Decisiones de diseño registradas

| Tema | Decisión |
|---|---|
| Alcance de esta etapa | Solo análisis y documentación — sin cambios de código |
| Recomendación elegida para implementar (próximo paso) | Problema #1: `DbPg` como singleton compartido (mismo patrón que `LogHelper`) en vez de `new Db()` por repository |
| Problemas identificados pero no elegidos | Doble chequeo de existencia en `updateAsync`, ramas `else` muertas en controllers, `console.log` sin control de entorno, `entities/` sub-utilizadas |
| Discrepancia documentada | `documents/server-capas-explicacion.md` y el enunciado del Ejercicio 06 describen un `DbPg` que devuelve `null`/`0` en error; el código actual ya lanza `AppError` vía `mapPgError` — documentación desactualizada, no un problema a resolver de nuevo |
| BD | **Sin cambios** en `databasecompleta.sql` ni en ningún script SQL |

---

## 8. 🔗 Adjuntos

- [ ] Link/PDF de la conversación completa con la IA
- [ ] Commit(s) en GitHub: `[YO] Completar`
- [ ] Capturas / evidencias de verificación
