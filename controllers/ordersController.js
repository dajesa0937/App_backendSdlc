const { findByStatus } = require('../models/order');
const Order = require('../models/order');
const OrderHasProduct = require('../models/order_has_products');

module.exports = {

  
  async findByStatus(req, res, next) {

    try {
        const status = req.params.status;
        const data = await Order.findByStatus(status);
        
        console.log(`Status ${JSON.stringify(data)}`);

        return res.status(201).json(data);

    } 
    catch (error) {
        console.log(`Error ${error}`);
        return res.status(501).json({
            message: 'Hay un error al obtener las Ordenes por Status',
            error: error, 
            success: false
        })
    }
}, 



    async create(req, res, next) {
        try {
            
          let order = req.body;
          order.status = 'PAGADO';
          const data = await Order.create(order);  

          console.log('LA ORDEN SE CREO CORRECTAMENTE');

        // Recorrer todos los productos agregados a la orden

          for (const product of order.products) {
                await OrderHasProduct.create(data.id, product.id, product.quantity);
          }
          
          return res.status(201).json({
            success: true,
            message: 'La Orden Se Creo Correctamente',
            data: data.id

         });

        } catch (error) {
            console.log(`Error ${error}`);
            return res.status(501).json({
               success: false,
               message: 'Hubo un error Creando la Orden',
               error: error
            });
        }
    }
}