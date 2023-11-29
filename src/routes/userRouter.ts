import contactsRouter from "./contactsRouter";

const Router = require('express');
const route = Router();
import controller from '../controllers/UserController'
import messageRouter from "./messageRouter";
import searchRouter from "./searchRouter";

route.use('/contacts', contactsRouter);
route.use('/message', messageRouter);
route.use('/search', searchRouter);

route.get('/getUser', controller.getUser);

export default route;