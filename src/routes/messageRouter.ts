import {body} from "express-validator";

const Router = require('express');
const route = Router();
import controller from '../controllers/MessageController'


route.get('/get/:contactId', controller.get);

route.post('/add', [
    body('message.text', "Message text should be between 1 and 2000 characters").isLength({min: 1, max: 2000})
    ],
    controller.add);

route.delete('/delete/:messageId', controller.delete);

route.patch('/edit/:messageId', [
        body('text', "Message text should be between 1 and 2000 characters").isLength({min: 1, max: 2000})
    ],
    controller.edit);



export default route;