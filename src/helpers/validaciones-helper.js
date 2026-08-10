// [IA]
import AppError from './app-error.js';

/**
 * Valida y convierte un id de URL o body a entero positivo.
 * @param {*} idParam Valor recibido (string o número).
 * @param {string} nombreCampo Nombre del campo para mensajes de error.
 * @returns {number} Entero positivo listo para usar en queries.
 */
export function parsearId(idParam, nombreCampo = 'id') {
    if (idParam === undefined || idParam === null || String(idParam).trim() === '') {
        throw AppError.badRequest(`El ${nombreCampo} es obligatorio.`);
    }

    const idStr = String(idParam).trim();

    if (!/^\d+$/.test(idStr)) {
        throw AppError.badRequest(`El ${nombreCampo} debe ser un número entero positivo.`);
    }

    const id = Number(idStr);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw AppError.badRequest(`El ${nombreCampo} debe ser un número entero positivo.`);
    }

    return id;
}

export function validarTextoObligatorio(nombreCampo, valor, maxLength = 75) {
    if (valor === undefined || valor === null) {
        throw AppError.badRequest(`El campo ${nombreCampo} es obligatorio.`);
    }
    if (typeof valor !== 'string') {
        throw AppError.badRequest(`El campo ${nombreCampo} debe ser texto.`);
    }
    const trimmed = valor.trim();
    if (trimmed.length === 0) {
        throw AppError.badRequest(`El campo ${nombreCampo} no puede estar vacío.`);
    }
    if (trimmed.length > maxLength) {
        throw AppError.badRequest(`El campo ${nombreCampo} no puede superar ${maxLength} caracteres.`);
    }
    return trimmed;
}

export function validarEnteroPositivo(nombreCampo, valor) {
    if (valor === undefined || valor === null || valor === '') {
        throw AppError.badRequest(`El campo ${nombreCampo} es obligatorio.`);
    }
    const num = Number(valor);
    if (!Number.isInteger(num) || num <= 0) {
        throw AppError.badRequest(`El campo ${nombreCampo} debe ser un número entero positivo.`);
    }
    return num;
}

export function validarEnteroPositivoOpcional(nombreCampo, valor) {
    if (valor === undefined || valor === null) {
        return null;
    }
    return validarEnteroPositivo(nombreCampo, valor);
}

export function validarNota(nota) {
    if (nota === undefined || nota === null || nota === '') {
        throw AppError.badRequest('El campo nota es obligatorio.');
    }
    const num = Number(nota);
    if (!Number.isInteger(num)) {
        throw AppError.badRequest('El campo nota debe ser un número entero.');
    }
    if (num < 0 || num > 10) {
        throw AppError.badRequest('El campo nota debe estar entre 0 y 10.');
    }
    return num;
}

export function validarBooleanoOpcional(nombreCampo, valor) {
    if (valor === undefined || valor === null) {
        return null;
    }
    if (typeof valor !== 'boolean') {
        throw AppError.badRequest(`El campo ${nombreCampo} debe ser verdadero o falso.`);
    }
    return valor;
}

export function validarFechaOpcional(nombreCampo, valor) {
    if (valor === undefined || valor === null) {
        return null;
    }
    if (typeof valor !== 'string') {
        throw AppError.badRequest(`El campo ${nombreCampo} debe tener formato de fecha (YYYY-MM-DD).`);
    }
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(valor)) {
        throw AppError.badRequest(`El campo ${nombreCampo} debe tener formato de fecha (YYYY-MM-DD).`);
    }
    const date = new Date(`${valor}T00:00:00`);
    if (isNaN(date.getTime())) {
        throw AppError.badRequest(`El campo ${nombreCampo} no es una fecha válida.`);
    }
    return valor;
}

export function validarBodyObjeto(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw AppError.badRequest('El body de la solicitud es inválido.');
    }
}
