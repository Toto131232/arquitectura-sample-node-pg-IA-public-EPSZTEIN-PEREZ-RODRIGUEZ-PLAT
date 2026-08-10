// [IA]
import { Router } from 'express';
import AuthService from '../services/auth-service.js';
import respuestasHelper from '../helpers/respuestas-helper.js';

const router = Router();
const currentService = new AuthService();

router.post('/login', async (req, res) => {
    try {
        console.log('AuthController.login');
        const result = await currentService.loginAsync(req.body);
        respuestasHelper.responderOk(res, result);
    } catch (error) {
        respuestasHelper.responderError(res, error);
    }
});

export default router;
