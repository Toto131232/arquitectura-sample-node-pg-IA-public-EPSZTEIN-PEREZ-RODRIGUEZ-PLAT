// [IA]
// Credenciales educativas: en producción deberían almacenarse hasheadas (bcrypt)
// en una tabla de usuarios, no en texto plano ni compararse directamente.
import jwt from 'jsonwebtoken';
import AppError from '../helpers/app-error.js';
import { validarBodyObjeto, validarTextoObligatorio } from '../helpers/validaciones-helper.js';

export default class AuthService {
    constructor() {
        console.log('Estoy en: AuthService.constructor()');
    }

    loginAsync = async (credentials) => {
        console.log('AuthService.loginAsync()');
        validarBodyObjeto(credentials);

        const username = validarTextoObligatorio('username', credentials.username);
        const password = validarTextoObligatorio('password', credentials.password);

        const jwtSecret = process.env.JWT_SECRET;
        const expectedUsername = process.env.AUTH_USERNAME;
        const expectedPassword = process.env.AUTH_PASSWORD;

        if (!jwtSecret || !expectedUsername || !expectedPassword) {
            throw AppError.internal('Configuración de autenticación incompleta.');
        }

        if (username !== expectedUsername || password !== expectedPassword) {
            throw AppError.unauthorized('Credenciales inválidas.');
        }

        const token = jwt.sign(
            { sub: username },
            jwtSecret,
            {
                expiresIn : process.env.JWT_EXPIRES_IN || '1h',
                algorithm : 'HS256'
            }
        );

        return { token };
    }
}
