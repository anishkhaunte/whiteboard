
const modules = include('modules')
const validator = require('validator')
const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const config = include('config')

router.param('userId', (req, res, next, id) =>
  Q().then(() =>
    req.app.models.User
    .findOne({_id: id}).exec()
  ).then(function (user) {
    if (!user) {
      return res.notFound()
    } else {
      req.user = user
      return next()
    }
  }).catch(function (err) {
    logError(err)
    return next(err)
  }).done()
)

/*
@api {GET} /users Users List
@apiName List
@apiGroup Users

@apiParam {String=active,inactive} [status=active]
@apiParam {String} [user_type]
@apiParam {String} [customer_type]
@apiParam {String} [organisation_id]
@apiParam {String} [keyword] Keyword to search in first_name, last_name and mobile_number
@apiParam {Number} [page=null] Page Number to Fetch from the Whole List
@apiParam {String} [sort_by_attr=first_name] Attribute on which to Sort the List
@apiParam {String=asc,desc} [sort_by_order=asc] Order of Sorting on the List

@apiSuccess {Boolean} status true
@apiSuccess {Array} data Array of user objects
*/
router.get('/', function (req, res, next) {
  let queryOpts
  const where = {}

  if (req.query.page) {
    const { page } = req.query

    queryOpts = {
      skip: (page - 1) * CONST.DEFAULT_PAGINATION_LIMIT,
      limit: CONST.DEFAULT_PAGINATION_LIMIT
    }
  } else {
    queryOpts = {}
  }
  return Q(where).then(where => req.app.models.User.find(where, {}, queryOpts).exec())
  .then(function(users) {
    res.success(users)
  }).catch(function (err) {
    logError(err)
    console.log(err)
    //return res.serverError()
  }).done()
})

/*
@api {POST} /users/login Login
@apiName Login
@apiGroup Users

@apiParam {String=account_manager,admin, employee} user_type

@apiParam (Login with Username) {String} username Email address / Mobile number of the user
@apiParam (Login with Username) {String} password Password entered by user


@apiSuccess {Boolean} status true
@apiSuccess {Object} data
@apiSuccess {String} data.session_token Session Token for authenticated API calls
@apiSuccess {String} data.user_id User ID of the User who logged in
*/
router.post('/login', modules.auth.authenticate('USERS', 'UPDATE', true), (req, res, next) =>
  Q((req.body.user_type || 'driver').toLowerCase()).then(function (userType) {
    if (!_.includes(['admin', 'account_manager', 'employee'], userType)) {
      return Q.reject({name: 'MissingUserType'})
    }

    if (!req.body.username && !req.body.user_id) {
      return Q.reject({name: 'MissingParams'})
    } else if (req.body.username && !req.body.password) {
      return Q.reject({name: 'MissingPassword'})
    } 

    const where = {status: CONST.DB_RECORD.ACTIVE}
    switch (userType) {
      case 'account_manager': where.role = CONST.ROLE.ACCOUNT_MANAGER; break
      case 'admin': where.role = CONST.ROLE.ADMIN; break
      case 'employee': where.role = CONST.ROLE.EMPLOYEE; break
    }

    if (req.body.username) {
      if (validator.isEmail(req.body.username)) {
        where.email_address = req.body.username
      } 
    } else {
      where._id = req.body.user_id
    }

    return req.app.models.User.findOne(where).sort({role: 1})
  }).then(function (user) {
    if (!user) { return Q.reject({name: 'UserNotFound'}) }

    if (req.body.password) {
      return [user, user.verifyPassword(req.body.password)]
    } 
  }).spread(function (user, valid_credentials) {
    if (!valid_credentials) { return Q.reject({name: 'InvalidCredential'}) }
    return [user, req.app.models.Session.findOne({user: user.id, status: CONST.DB_RECORD.ACTIVE})]
  }).spread(function (user, existing_session) {
    if (existing_session) {
      return Q.resolve([user, existing_session, existing_session.token])
    } else { return [user, null, modules.auth.getSessionToken(user)] }
  }).spread(function (user, existing_session, token) {
    if (existing_session) {
      return [user, existing_session]
    } else {
      const session = req.app.models.Session({
        token,
        user: user.id
      })
      return [user, session.save()]
    }
  }).spread((user, session) =>
    res.success({
      session_token: session.token,
      user_id: user ? user.id : null,
      first_name: user ? user.first_name : null,
      last_name: user ? user.last_name : null
    })
  ).catch(function (err) {
    logError(err)

    // change_auth = true or false. True is for "FMS login", we are using error 403 for wrong AuthenticationError , InvalidCredential and UserNotFound instead of 401.
    switch (err.name) {
      case 'AuthenticationError':
        if (req.body.change_auth === true) {
          return res.forbidden()
        } else {
          return res.unAuthorized()
        }

      case 'InvalidCredential':
        if (req.body.change_auth === true) {
          return res.forbidden()
        } else {
          return res.unAuthorized()
        }

      case 'UserNotFound':
        if (req.body.change_auth === true) {
          return res.forbidden()
        } else {
          return res.unAuthorized()
        }
      case 'MissingUserType': return res.badRequest()
      case 'MissingParams': return res.badRequest()
      case 'MissingPassword': return res.badRequest()
      default: return res.serverError()
    }
  }).done()
)



/*
@api {POST} /users Create an User
@apiName Create
@apiGroup Users

@apiParam {String} [first_name]
@apiParam {String} [last_name]
@apiParam {String} email_address
@apiParam {String} [password]
@apiParam {String} [write_access] Write access for a user
@apiParam {Number} role

@apiSuccess {Boolean} status true
@apiSuccess {Object} data
@apiSuccess {String} data.id Id of the successfully created user
*/
router.post('/', (req, res, next) =>
  Q().then(function () {
    const user = new req.app.models.User({
      first_name: req.body.first_name || null,
      last_name: req.body.last_name || null,
      email_address: req.body.email_address,
      role: req.body.role,
      write_access: req.body.write_access || false
    })

    if (req.body.password) { user.password = req.body.password }

    return user.save()
  }).then(user => res.success({user}, HTTP_STATUS_CODES.CREATED)).catch(function (err) {
    if (err == null) { err = Error() }
    logError(err)
    switch (err.name) {
      case 'InvalidRequest': return res.badRequest()
      case 'MongoError':
        switch (err.code) {
          case 11000:
            return Q().then(() =>
              req.app.models.User
              .findOne({
                mobile_number: req.body.mobile_number,
                role: req.body.user_type || CONST.ROLE.USER
              }).select('id').exec()
            ).then(function (user) {
              if (!user) {
                return Q.reject({name: 'InvalidRequest'})
              } else { return res.success({id: user.id}) }
            }).catch(function (err) {
              if (err == null) { err = Error() }
              logError(err)
              switch (err.name) {
                case 'InvalidRequest': return res.badRequest()
                default: return res.serverError()
              }
            }).done()
          default: return res.serverError()
        }
      default: return res.serverError()
    }
  }).done()
)

/*
@api {GET} /users/:userId User Details from ID
@apiName UserDetails
@apiGroup Users

@apiSuccess {Boolean} status true
@apiSuccess {Object} data User Object for ID will be returned
*/
router.get('/:userId', function (req, res, next) {
  let user = req.user
  return res.success({user},HTTP_STATUS_CODES.CREATED)
})


/*
@api {DELETE} /users/:userId Delete an user
@apiName Delete
@apiGroup Users

@apiPermission Admin
@apiHeader {String} Authorization Session Token

@apiSuccess {Boolean} status true
*/
router.delete('/:userId', modules.auth.authenticate('USERS', 'DELETE'), function (req, res, next) {
  return req.user.remove(function () {
    return res.success()
  })
})

module.exports = router
