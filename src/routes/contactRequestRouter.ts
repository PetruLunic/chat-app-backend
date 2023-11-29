const Router = require('express');
const route = Router();
import controller from '../controllers/ContactRequestsController'


route.get('/get/in', controller.getIn);
route.get('/get/out', controller.getOut);
route.post('/add', controller.add);
route.delete('/delete/:contactId', controller.delete);



export default route;