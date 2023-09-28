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
const session = require('express-session'); // Agregado

/*
* INICIALIZACIÓN DE FIREBASE ADMIN
*/

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
})

const upload = multer({
    storage: multer.memoryStorage()
})

/* 
* CREACIÓN DE LAS RUTAS
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
app.use(session({ // Agregado
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.disable('x-powered-by');
app.set('port', port);

users(app, upload);
categories(app);
address(app);
orders(app);
products(app, upload);

server.listen(3000, '192.168.20.23' || 'localhost', function () {
    console.log('Corriendo la aplicacion Node js ' + port + ' Iniciando...')
});



// CONFIGURACIÓN DE ERRORES

app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send(err.stack);
});

module.exports = {
    app: app,
    server: server
}
