const mongoose = require('mongoose'); /* module de base de données */
const uniqueValidator = require('mongoose-unique-validator'); /* module de clé unique de base de données */

const userAccount = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password : {type: String, required: true},
})

userAccount.plugin(uniqueValidator)

module.exports = mongoose.model('userAccount', userAccount)