
const path = require('path')

global.HTTP_STATUS_CODES = require('http-status-codes')

global._ = require('lodash')

global.Q = require('q')

global.moment = require('moment')

global.__projectdir = `${__dirname}${path.sep}`

global.__rootdir = `${process.cwd()}${path.sep}`

global.fullPath = file => `${__projectdir}${file}`

global.include = file => require(`${fullPath(file)}`)

global.CONST = {
  DB_RECORD: {
    ACTIVE: 1,
    INACTIVE: 2,
    UNVERIFIED: 3
  },
  ROLE: {
    ADMIN: 1, // Full access, can create user
    ACCOUNT_MANAGER: 2, // user with write access
    EMPLOYEE: 3 //Only read access
  },
  DEFAULT_PAGINATION_LIMIT: 30,
  TIMEZONE: 'Asia/Kolkata',
  REQUEST_METHOD: {
    POST: 'POST',
    GET: 'GET'
  },
  APPROVAL_TYPE: {
    PENDING: 0,
    APPROVED: 1
  }
}

global.CONST.ACCESS = {
  USERS: {
    CREATE: [  CONST.ROLE.ADMIN ],
    READ: [ CONST.ROLE.ADMIN, CONST.ROLE.ACCOUNT_MANAGER, CONST.ROLE.EMPLOYEE ],
    UPDATE: [ CONST.ROLE.ADMIN, CONST.ROLE.ACCOUNT_MANAGER, CONST.ROLE.EMPLOYEE ],
    DELETE: [ CONST.ROLE.ADMIN ]
  },
  MANAGEMENT: {
    CREATE: [  CONST.ROLE.ADMIN, CONST.ROLE.ACCOUNT_MANAGER ],
    READ: [ CONST.ROLE.ADMIN ],
    UPDATE: [ CONST.ROLE.ADMIN ],
    DELETE: [ CONST.ROLE.ADMIN ]
  }
}

global.logError = function (err) {
  console.error(err)
  return console.error(err.stack)
}
