const OrdersController = require('../controllers/ordersController');
const passport = require('passport');

module.exports = (app) => {


    /**
     * GET ROUTES RUTAS 
     */
    
     app.get('/api/orders/findByStatus/:status', passport.authenticate('jwt', {session: false}), OrdersController.findByStatus);

    /*
        *POST ROUTES 
    */ 
    app.post('/api/orders/create', passport.authenticate('jwt', {session: false}), OrdersController.create);


}