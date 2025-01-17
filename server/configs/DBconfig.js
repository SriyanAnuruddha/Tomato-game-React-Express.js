const { Sequelize } = require('sequelize')

// create a database object using sqlite database
const sequelizeObj = new Sequelize('db', 'user', 'password', {
    dialect: 'sqlite',
    host: './db.sqlite',
    logging: false
})

module.exports = sequelizeObj;