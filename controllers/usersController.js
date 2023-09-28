const User = require('../models/user');
const Rol = require('../models/rol');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const storage = require('../utils/cloud_storage');


module.exports = {
    async getAll(req, res, next) {
        try {
            const data = await User.getAll();
            console.log(`Usuarios: ${data}`);
            return res.status(201).json(data);


        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error al obtener los usuarios'
            });
        }

    },

    async findById(req, res, next) {
        try {

            const id = req.params.id;
            const data = await User.findByUserId(id);
            console.log(`Usuario: ${data}`);
            return res.status(201).json(data);


        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error al obtener el usuario por ID'
            });
        }

    },

    async findDeliveryMen(req, res, next) {
        try {

            const data = await User.findDeliveryMen();
            console.log(`Vendedores: ${data}`);
            return res.status(201).json(data);


        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error al obtener los vendedores'
            });
        }

    },


    async register(req, res, next) {
        try {

            const user = req.body;
            const data = await User.create(user);

            await Rol.create(data.id, 1); // se establece el rol por defecto cliente id: 1

            return res.status(201).json({
                success: true,
                message: 'El registro se realizo correctamente, Inicia Sesion',
                data: data.id

            });
        } catch (error) {
            console.log(`Error: ${error}`)
            return res.status(501).json({
                success: false,
                message: 'Error al registrarse en el Sistema',
                error: error

            });
        }
    },

    async registerWithImage(req, res, next) {
        try {

            const user = JSON.parse(req.body.user);

            console.log(`Datos Enviados del Usuario: ${user}`);

            const files = req.files;

            if (files.length > 0) {
                const pathImage = `image_${Date.now()}`; // CREACION DEL ARCHIVO A ALMACENAR EN FIREBASE
                const url = await storage(files[0], pathImage);

                if (url != undefined && url != null) {
                    user.image = url;
                }
            }

            const data = await User.create(user);



            await Rol.create(data.id, 1); // se establece el rol por defecto cliente id: 1

            return res.status(201).json({
                success: true,
                message: 'El registro se realizo correctamente, Inicia Sesion',
                data: data.id

            });
        } catch (error) {
            console.log(`Error: ${error}`)
            return res.status(501).json({
                success: false,
                message: 'Error al registrarse en el Sistema',
                error: error

            });
        }
    },


    async update(req, res, next) {
        try {

            const user = JSON.parse(req.body.user);

            console.log(`Datos Enviados del Usuario: ${JSON.stringify(user)}`);

            const files = req.files;

            if (files.length > 0) {
                const pathImage = `image_${Date.now()}`; // CREACION DEL ARCHIVO A ALMACENAR EN FIREBASE
                const url = await storage(files[0], pathImage);

                if (url != undefined && url != null) {
                    user.image = url;
                }
            }

            await User.update(user);


            return res.status(201).json({
                success: true,
                message: 'Datos Actualizados',

            });
        } catch (error) {
            console.log(`Error: ${error}`)
            return res.status(501).json({
                success: false,
                message: 'Error En La Actualizacion De Datos De Usuario',
                error: error

            });
        }
    },

    async login(req, res, next) {
        try {
            const email = req.body.email;
            const password = req.body.password;

            const myUser = await User.findByEmail(email);

            if (!myUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Email no se encuentra Registrado'
                });
            }

            if (User.isPasswordMatched(password, myUser.password)) {
                const token = jwt.sign({ id: myUser.id, email: myUser.email }, keys.secretOrKey, {

                    // expiresIn: (60*60*24) // expira el token en 1 hora
                    //expiresIn: (60*3) // expira el token en 3 minutos

                });
                const data = {
                    id: myUser.id,
                    email: myUser.email,
                    name: myUser.name,
                    lastname: myUser.lastname,
                    phone: myUser.phone,
                    image: myUser.image,
                    session_token: `JWT ${token}`,
                    roles: myUser.roles

                }

                await User.updateToken(myUser.id, `JWT ${token}`);

                console.log(`USUARIO ENVIADO ${data}`);

                return res.status(201).json({
                    success: true,
                    data: data,
                    message: 'Usuario No ha sido Autenticado en el Sistema'
                });
            }
            else {
                return res.status(401).json({
                    success: false,
                    message: 'Contraseña Incorrecta'

                });
            }

        }

        catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error en el LOGIN',
                error: error


            });
        }


    },

    async logout(req, res, next) {
        try {
            const id = req.body.id;
            await User.updateToken(id, null);
            return res.status(201).json({
                success: true,
                message: 'Sesion De Usuario se Cerro Correctamente'
            });

        }
        catch (e) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error al Cerrar Sesion',
                error: error
            });

        }
    }


};

