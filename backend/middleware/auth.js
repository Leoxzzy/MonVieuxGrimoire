const jwt = require('jsonwebtoken'); /* gestion des tokens utilisateurs */
require('dotenv').config();


const auth = (req, res, next) => {
    const token = req.headers['authorization'].split(' ')[1];
    if (!token) { return res.status(401).json({ message: 'Token manquant' }) };

    jwt.verify(token, process.env.jwtSecretKey, (error, decoded) => {
        if (error) { return res.status(401).json({ message: 'Token invalide' }) };

        req.user = decoded;
        next();
    });
}

module.exports = auth;