const Router = require('express');
const route = Router();
import controller from '../controllers/ContactsController';
import requestRouter from './contactRequestRouter';

route.use('/request', requestRouter);

route.get('/get', controller.get);
route.post('/add', controller.add);
route.delete(`/delete/:contactId`, controller.delete);

export default route;