const userAccount = require('../models/userAccount'); /* model de base de données concernant les utilisateurs */
const bcrypt = require('bcrypt'); /* module cryptant les mots de passe */
const jwt = require('jsonwebtoken'); /* gestion des tokens utilisateurs */
require('dotenv').config();


exports.createUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then((hash) => {
            const user = new userAccount({
                email: req.body.email,
                password: hash
            })

            user.save()
                .then(() => res.status(201).json({ message: 'Nouvel utilisateur enregistré!' }))
                .catch((error) => res.status(500).json({ error }))
        })
        .catch((error) => res.status(500).json({ error }))
}

exports.loginUser = (req, res, next) => {
    userAccount.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: "Aucun utilisateur avec cet E-Mail trouvé." })
            }

            bcrypt.compare(req.body.password, user.password)
                .then((valid) => {
                    if (!valid) {
                        return res.status(400).json({ message: "Mot de passe incorrect." })
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign( { userId: user._id }, process.env.jwtSecretKey, { expiresIn: '24h' } )
                    })
                })
                .catch((error) => res.status(500).json({ error }))
        })
        .catch((error) => res.status(500).json({ error }))
}