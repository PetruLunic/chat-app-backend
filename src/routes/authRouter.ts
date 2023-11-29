import {Router} from "express";
import {check} from "express-validator";
import controller from '../controllers/AuthController';

const route = Router();

route.post('/registration', [
    check('username', "Username should be 2 or longer").isLength({min: 2, max: 30}),
    check('password', "Password should be 6 or longer and 14 or shorter").isLength({min: 6, max: 14})
], controller.registration);

route.post('/login', controller.login);

export default route;