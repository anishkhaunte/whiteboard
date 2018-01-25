// Response Shortcuts
// Response format supported: json

module.exports = function (req, res, next) {
  res.sendResponse = function (obj) {
    if (arguments.length === 2) {
      if (typeof arguments[1] === 'number') {
        res.statusCode = arguments[1]
      } else {
        res.statusCode = obj
        obj = arguments[1]
      }
    }

    res.header('Content-Type', 'application/json')
    return res.send(obj)
  }

  res.success = function (data = null, code) {
    if (code == null) { code = HTTP_STATUS_CODES.OK }
    return res.sendResponse(code, {
      status: true,
      data
    })
  }

  res.badRequest = function (message) {
    if (message == null) { message = 'required parameters missing or invalid' }
    return res.sendResponse(HTTP_STATUS_CODES.BAD_REQUEST, {
      status: false,
      error: {
        code: HTTP_STATUS_CODES.BAD_REQUEST,
        name: 'BAD_REQUEST',
        message: `Bad Request, ${message}`
      }
    })
  }

  res.invalidRequest = function (message) {
    if (message == null) { message = 'required parameters missing or invalid' }
    return res.sendResponse(HTTP_STATUS_CODES.BAD_REQUEST, {
      status: false,
      message
    })
  }

  res.unAuthorized = function (message) {
    if (message == null) { message = 'invalid authentication data' }
    return res.sendResponse(HTTP_STATUS_CODES.UNAUTHORIZED, {
      status: false,
      error: {
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
        name: 'UNAUTHORIZED',
        message: `Unauthorized, ${message}`
      }
    })
  }

  res.forbidden = function (message) {
    if (message == null) { message = 'authentication required' }
    return res.sendResponse(HTTP_STATUS_CODES.FORBIDDEN, {
      status: false,
      error: {
        code: HTTP_STATUS_CODES.FORBIDDEN,
        name: 'FORBIDDEN',
        message: `Forbidden, ${message}`
      }
    })
  }

  res.notFound = function (message) {
    if (message == null) { message = 'requested resource not available' }
    return res.sendResponse(HTTP_STATUS_CODES.NOT_FOUND, {
      status: false,
      error: {
        code: HTTP_STATUS_CODES.NOT_FOUND,
        name: 'NOT_FOUND',
        message: `Not Found, ${message}`
      }
    })
  }

  res.serverError = function (message) {
    if (message == null) { message = 'Internal server error occurred' }
    return res.sendResponse(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, {
      status: false,
      error: {
        code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        name: 'INTERNAL_SERVER_ERROR',
        message
      }
    })
  }

  return next()
}
