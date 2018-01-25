
const config = include('config')
const jwt = require('jsonwebtoken')

module.exports = {

  authenticate (model, action, bypass) {
    return function (req, res, next) {
      let session_token = null
    
      if (bypass) { //If we want to skip the authentication module 
        return next()
      }

      return Q().then(function () {
        if (req.headers.authorization) {
          session_token = req.headers.authorization
        } else if (req.query && req.query.token) {
          session_token = req.query.token
        } else if (req.body && req.body.token) {
          session_token = req.body.token
        }
        if (!session_token) {
          return Q.reject({name: 'SessionTokenNotFound'})
        } else { return Q.nfcall(jwt.verify, session_token, config.jwt.secret) }
      }).then(function (decoded_token) {
        if (!decoded_token || !decoded_token.user_id) { return Q.reject({name: 'SessionTokenInvalid'}) }
        return req.app.models.Session.findOne({
          user: decoded_token.user_id,
          status: CONST.DB_RECORD.ACTIVE
        }).populate(['user']).exec()
      }).then(function (session) {
        if ((session != null ? session.token : undefined) !== session_token) { return Q.reject({name: 'SessionTokenInvalid'}) }
        req.session = session

        if (session.user && _.contains(CONST.ACCESS[model][action], session.user.role)) {
          return next()
        } else {
          return Q.reject({name: 'UserNotAuthorized'})
        }
      }).catch(function (err) {
        if (err == null) { err = Error() }
        logError(err)
        switch (err.name) {
          case 'UserNotAuthorized': return res.forbidden()
          default: return res.unAuthorized()
        }
      }).done()
    }
  },

  authenticateAdmin (model, action) {
    return function (req, res, next) {
      let session_token = null

      return Q().then(function () {
        if (req.headers.authorization) {
          session_token = req.headers.authorization
        } else if (req.query && req.query.token) {
          session_token = req.query.token
        } else if (req.body && req.body.token) {
          session_token = req.body.token
        }
        if (!session_token) {
          return Q.reject({name: 'SessionTokenNotFound'})
        } else { return Q.nfcall(jwt.verify, session_token, config.jwt.secret) }
      }).then(function (decoded_token) {
        if (!decoded_token || !decoded_token.user_id) { return Q.reject({name: 'SessionTokenInvalid'}) }
        return req.app.models.Session.findOne({
          user: decoded_token.user_id,
          status: CONST.DB_RECORD.ACTIVE
        }).populate(['user', 'user.company']).exec()
      }).then(function (session) {
        if ((session != null ? session.token : undefined) !== session_token) { return Q.reject({name: 'SessionTokenInvalid'}) }
        req.session = session
        if (session.user && _.contains(CONST.ACCESS[model][action], session.user.role)) {
          return next()
        } else {
          return Q.reject({name: 'UserNotAuthorized'})
        }
      }).catch(function (err) {
        if (err == null) { err = Error() }
        logError(err)
        switch (err.name) {
          case 'UserNotAuthorized': return res.forbidden()
          default: return res.unAuthorized()
        }
      }).done()
    }
  },

  getSessionToken (user) {
    const token = jwt.sign({user_id: user.id}, config.jwt.secret)
    return Q.resolve(token)
  },

  hasWriteAccess () {
    return function (req, res, next) {
      //If user is admin allow him
      //If user isnt admin check for his write access
      if (req.headers.authorization === config.external_provider_token) {
        return next()
      } else {
        return res.unAuthorized()
      }
    }
  }

}
