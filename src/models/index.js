const config = include('config')
const mongoose = require('mongoose')
const path = require('path')


mongoose.set('debug', config.database.debug || false)
const uri = config.database.uri || `mongodb://${config.database.host}:${config.database.port || 27017}/${config.database.name}`

mongoose.connect(uri, {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  user: config.database.username,
  pass: config.database.password
}, function (err) {
  if (err) {
    logError(err)
    return process.exit()
  } else { return console.log('Connected to database...') }
})

const Models = {
  mongoose,
  User: mongoose.model('User', require(path.join(__dirname, '/user'))),
  Session: mongoose.model('Session', require(path.join(__dirname, '/session'))),
  UserRequest: mongoose.model('UserRequest', require(path.join(__dirname, '/userrequest')))
}

module.exports = Models
