const express = require('express'); /* framework de l'api */
const mongoose = require('mongoose'); /* module de gestion de base de données (mongoDB) */
const path = require('path'); /* module de gestion de chemins de fichiers */

require('dotenv').config();

const multer = require('./middleware/multer-config'); /* middleware de gestion de fichiers envoyés au serveur */
const auth = require('./middleware/auth') /* middleware d'authentification de tokens utilisateurs */

const userCtrl = require('./controllers/users') /* controller concernant les utilisateurs */
const booksCtrl = require('./controllers/books') /* controller concernant les livres */

/* connexion à la base de données MongoDB (atlas) */
mongoose.connect(process.env.mongooseKey, {})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((error) => console.log('Connexion à MongoDB échouée !', error));


const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
})


/* routes concernant les utilisateurs */
app.post('/api/auth/signup', userCtrl.createUser) /* création de compte utilisateur */
app.post('/api/auth/login', userCtrl.loginUser) /* connexion à une compte utilisateur */


/* routes concernant les livres */
app.post('/api/books', auth, multer, booksCtrl.createBook) /* création de livre */
app.get('/api/books', booksCtrl.loadBooks) /* récupérations des livres */
app.get('/api/books/bestrating', booksCtrl.getBestRating) /* récupérations des livres les mieux notés */

app.get('/api/books/:id', booksCtrl.loadBook) /* récupération d'un livre en fonction de son ID */
app.post('/api/books/:id/rating', auth, booksCtrl.rateBook) /* notation d'un livre en fontion de son ID */
app.put('/api/books/:id', auth, multer, booksCtrl.updateBook) /* modification d'un livre en fonction de son ID */
app.delete('/api/books/:id', auth, booksCtrl.deleteBook) /* suppression d'un livre en fonction de son ID */


/* route concernant les images */
app.use('/images', express.static(path.join(__dirname, 'images'))); /* récupération d'une image en fonction de son nom */



module.exports = app;