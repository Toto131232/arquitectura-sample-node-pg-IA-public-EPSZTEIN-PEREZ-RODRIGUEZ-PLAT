// [IA] Script temporal de verificación Ejercicio 05
import 'dotenv/config';
import jwt from 'jsonwebtoken';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function request(method, path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: options.headers,
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* plain text */ }
    return { status: res.status, text, json };
}

function assert(name, condition, detail = '') {
    const ok = condition ? 'PASS' : 'FAIL';
    console.log(`${ok}  ${name}${detail ? ' — ' + detail : ''}`);
    return condition;
}

async function waitForServer() {
    for (let i = 0; i < 10; i++) {
        try {
            await fetch(`${BASE}/api/auth/login`, { method: 'OPTIONS' }).catch(() => fetch(`${BASE}/api/alumnos`));
            return true;
        } catch { await new Promise(r => setTimeout(r, 500)); }
    }
    return false;
}

if (!(await waitForServer())) {
    console.error('FAIL  Servidor no disponible en', BASE);
    process.exit(1);
}

const results = [];

const loginOk = await request('POST', '/api/auth/login', {
    headers: { 'Content-Type': 'application/json' },
    body: { username: 'admin', password: 'admin123' }
});
results.push(assert('CASO 1 login correcto → 200 + token',
    loginOk.status === 200 && loginOk.json?.token,
    `status=${loginOk.status}`));

const validToken = loginOk.json?.token;

const loginFail = await request('POST', '/api/auth/login', {
    headers: { 'Content-Type': 'application/json' },
    body: { username: 'admin', password: 'wrong' }
});
results.push(assert('CASO 2 login incorrecto → 401',
    loginFail.status === 401,
    `status=${loginFail.status}`));

const delNoAuth = await request('DELETE', '/api/alumnos/3');
results.push(assert('CASO 3 DELETE sin Authorization → 401',
    delNoAuth.status === 401,
    `status=${delNoAuth.status}`));

const delBadFormat = await request('DELETE', '/api/alumnos/3', {
    headers: { Authorization: 'Token abc' }
});
results.push(assert('CASO 4 DELETE Authorization mal formado → 401',
    delBadFormat.status === 401,
    `status=${delBadFormat.status}`));

const delInvalid = await request('DELETE', '/api/alumnos/3', {
    headers: { Authorization: 'Bearer token.invalido' }
});
results.push(assert('CASO 5 DELETE JWT inválido → 401',
    delInvalid.status === 401,
    `status=${delInvalid.status}`));

const expiredToken = jwt.sign({ sub: 'admin' }, process.env.JWT_SECRET, { expiresIn: '-1s', algorithm: 'HS256' });
const delExpired = await request('DELETE', '/api/alumnos/3', {
    headers: { Authorization: `Bearer ${expiredToken}` }
});
results.push(assert('CASO 6 DELETE JWT vencido → 401',
    delExpired.status === 401,
    `status=${delExpired.status} msg=${delExpired.json?.message}`));

const delValid = await request('DELETE', '/api/alumnos/99999', {
    headers: { Authorization: `Bearer ${validToken}` }
});
results.push(assert('CASO 7 DELETE con JWT válido → no 401',
    delValid.status !== 401,
    `status=${delValid.status} (404/409/200 OK — middleware dejó pasar)`));

const tampered = validToken.slice(0, -4) + 'XXXX';
const delTampered = await request('DELETE', '/api/alumnos/3', {
    headers: { Authorization: `Bearer ${tampered}` }
});
results.push(assert('CASO 8 JWT modificado → 401',
    delTampered.status === 401,
    `status=${delTampered.status}`));

const postNoAuth = await request('POST', '/api/alumnos', {
    headers: { 'Content-Type': 'application/json' },
    body: { nombre: 'Test', apellido: 'Auth' }
});
const putNoAuth = await request('PUT', '/api/alumnos/1', {
    headers: { 'Content-Type': 'application/json' },
    body: { nombre: 'Test' }
});
results.push(assert('CASO 9 POST sin token → 401', postNoAuth.status === 401, `status=${postNoAuth.status}`));
results.push(assert('CASO 9 PUT sin token → 401', putNoAuth.status === 401, `status=${putNoAuth.status}`));

const getPublic = await request('GET', '/api/alumnos');
results.push(assert('CASO 10 GET público → responde sin 401',
    getPublic.status !== 401,
    `status=${getPublic.status}`));

console.log('\n--- Resumen ---');
console.log(`Pasaron: ${results.filter(Boolean).length}/${results.length}`);
process.exit(results.every(Boolean) ? 0 : 1);
