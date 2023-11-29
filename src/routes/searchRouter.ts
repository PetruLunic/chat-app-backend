const Router = require('express');
const route = Router();
import controller from '../controllers/SearchController'

route.get('/users', controller.users);

export default route;