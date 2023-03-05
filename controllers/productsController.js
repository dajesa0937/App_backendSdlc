const Product = require('../models/product');
const storage = require('../utils/cloud_storage');
const asyncForEach = require('../utils/async_foreach');


module.exports = {

    async findByCategory(req, res, next) {
        try {

            const id_category = req.params.id_category; // cliente
            const data = await Product.findByCategory(id_category);

            return res.status(201).json(data);

        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                message: `Error Al Listar Los Productos por Categoria ${error}`,
                succes: false,
                error: error
            });
        }
    },

    async create(req, res, next) {
        let product = JSON.parse(req.body.product);

        console.log(`Producto ${JSON.stringify(product)}`);

        const files = req.files;

        let inserts = 0;
        if (files.length === 0) {
            return res.status(501).json({
                message: 'Error al registrar el Producto, Ingrese Una Imagen!!',
                succes: false
            });
        }
        else {
            try {
                const data = await Product.create(product); // almacenando el producto
                product.id = data.id;

                const start = async () => {
                    await asyncForEach(files, async (file) => {
                        const pathImage = `image_${Date.now()}`;
                        const url = await storage(file, pathImage);

                        if (url != undefined && url !== null) {
                            if (inserts == 0) {
                                product.image1 = url;

                            }
                            else if (inserts == 1) {
                                product.image2 = url;
                            }

                            else if (inserts == 2) {
                                product.image3 = url;
                            }
                        }

                        await Product.update(product);
                        inserts = inserts + 1;

                        if (inserts == files.length) {
                            return res.status(201).json({
                                succes: true,
                                message: 'El Producto Se ha Registrado Correctamente'
                            });
                        }
                    });
                }

                start();
            }
            catch (error) {
                console.log(`Error: ${error}`);
                return res.status(501).json({
                    message: `Error Al Registrar el Producto ${error}`,
                    succes: false,
                    error: error
                });


            }
        }

    }

}
