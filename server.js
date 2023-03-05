const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const logger = require('morgan');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const serviceAccountKey = require('./serviceAccountKey.json');
const passport = require('passport');

const { truncate } = require('fs/promises');

/*
*INICIALIZACION DE FIREBASE ADMIN
*/

admin.initializeApp({
    Credential: admin.credential.cert(serviceAccountKey)
})

const upload = multer({
    storage: multer.memoryStorage()
})

/* 
* CREACION DE LAS RUTAS
*/

const users = require('./routes/usersRoutes');
const categories = require('./routes/categoriesRoutes');
const products = require('./routes/productsRoutes');
const address = require('./routes/addressRoutes');
const orders = require('./routes/ordersRoutes');




const port = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);


app.disable('x-powered-by');

app.set('port', port);

// LLAMANDO A LAS RUTAS

users(app, upload);
categories(app);
address(app);
orders(app);
products(app, upload);

server.listen(3000, '192.168.58.1' || 'localhost', function () {
    console.log('Corriendo la aplicacion Node js ' + port + ' Iniciando...')
});

// CONNFIGURACION DE ERRORES

app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send(err.stack);
});

module.exports = {
    app: app,
    server: server
}
