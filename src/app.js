
require('./globals')
//const shell = require('shelljs')
const express = require('express')
const bodyParser = require('body-parser')
//shell.exec('phantomjs utils/phantom_server.js', {async: true})
const routes = require('./routes')
const modules = require('./modules')
const path = require('path')

const app = express()
app.config = include('config')
app.models = include('models')


app.use(modules.middlewares.response)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
//app.use(modules.middlewares.logger.request)
app.use(modules.middlewares.cors)

app.use('/v1', routes)

app.use('/', express.static(path.join(__dirname, '/static')))

/*
if (process.env.NODE_ENV !== 'production') {
  app.use('/v1/docs', modules.auth.basic, express.static('docs'))
}

app.use(modules.middlewares.logger.error)*/
app.use((err, req, res, next) => {
  if (err) {
    logError(err)
  }
  res.serverError()
})

// Extensions to Lodash - START

_.toTitleCase = str => str.charAt(0) + str.substr(1).toLowerCase()

_.truthyJoin = arr => _.filter(arr, item => item).join(' ')

// Extensions to Lodash - END
 

module.exports = app
