-- =========================================================
-- BASE ORIGINAL DEL PROYECTO
-- =========================================================

-- Tabla cursos
CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(75) NOT NULL
);

-- Tabla alumnos
CREATE TABLE alumnos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(75) NOT NULL,
    apellido VARCHAR(75) NOT NULL,
    id_curso INT REFERENCES cursos(id),
    fecha_nacimiento DATE,
    hace_deportes BOOLEAN
);

-- =========================================================
-- INSERTS ORIGINALES DE cursos
-- =========================================================

INSERT INTO cursos (nombre) VALUES ('5IA');
INSERT INTO cursos (nombre) VALUES ('5IB');
INSERT INTO cursos (nombre) VALUES ('5IC');
INSERT INTO cursos (nombre) VALUES ('5ID');
INSERT INTO cursos (nombre) VALUES ('5IE');

-- =========================================================
-- INSERTS ORIGINALES DE alumnos
-- =========================================================

-- ACÁ VAN EXACTAMENTE TODOS LOS INSERTS
-- DEL ARCHIVO ORIGINAL database, SIN MODIFICARLOS.

-- =========================================================
-- EJERCICIO 01 — NUEVAS TABLAS
-- =========================================================

-- Tabla materias
CREATE TABLE materias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(75) NOT NULL
);

-- Tabla calificaciones
CREATE TABLE calificaciones (
    id SERIAL PRIMARY KEY,
    id_alumno INT NOT NULL REFERENCES alumnos(id),
    id_materia INT NOT NULL REFERENCES materias(id),
    nota INT NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(id_alumno, id_materia)
);

-- Datos de prueba para materias
INSERT INTO materias (nombre) VALUES ('Matemática');
INSERT INTO materias (nombre) VALUES ('Lengua');
INSERT INTO materias (nombre) VALUES ('Historia');
INSERT INTO materias (nombre) VALUES ('Programación');
INSERT INTO materias (nombre) VALUES ('Base de Datos');