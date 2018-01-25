const modules = include('modules')
const express = require('express')
const router = express.Router()

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
@api {POST} /management/requests/list fetch list of all pending requests
@apiName List
@apiGroup Management

@apiSuccess {Boolean} status true
@apiSuccess {Object} data
*/
router.get('/requests/list', (req, res, next) =>
  Q().then(function() {
    let query_opts
    const where = {}
    where.approval_status = CONST.APPROVAL_TYPE.PENDING

    if (req.query.count_only) {
      query_opts = {}
    } else {
      const page = req.query.page || 1

      query_opts = {
        skip: (page - 1) * CONST.DEFAULT_PAGINATION_LIMIT,
        limit: CONST.DEFAULT_PAGINATION_LIMIT
      }
    }

    return req.app.models.UserRequest.find(where, {}, query_opts).exec()
  }).then(function (userrequests) {
    if (req.query.count_only) {
      return res.success(userrequests.length)
    } else {
      return res.success(userrequests)
    }
  }).catch(function (err) {
    if (err == null) { err = Error() }
    logError(err)
    return res.serverError()
  }).done()
)


/*
@api {POST} /management/request_access Provides a normal user to request for write access
@apiName Request
@apiGroup Management

@apiParam {String} [user_id]

@apiSuccess {Boolean} status true
@apiSuccess {Object} data
*/
router.post('/request_access',(req,res,next) =>
	Q().then(function(){
    console.log('the sent user_id')
    console.log(req.body)
		req.app.models.UserRequest.findOne({user_id: req.body.user_id})
	}).then(function(userrequest) {
		if (userrequest && userrequest.approval_status === 0) {
			Q.reject({name:'RequestAlreadyReceived'})
		} else if (userrequest && userrequest.approval_status === 1) {
			Q.reject({name:'UserHasAccess'})
		} else {
			userRequest = new req.app.models.UserRequest({
				user_id: req.body.user_id,
				request_timestamp: moment()
			})
			return userRequest.save()
		}
	}).then(function(userrequest){
    res.success(userrequest)
  }).catch(function (err) {
    logError(err)
  }).done()
)

/*
@api {POST} /management/approve_access Provides a normal user to request for write access
@apiName Approve
@apiGroup Management

@apiParam {String} [user_id]

@apiSuccess {Boolean} status true
@apiSuccess {Object} data
*/
router.post('/approve_request', (req,res,next) =>
	Q().then(function(){
		return [req.app.models.UserRequest.findOne({user_id:req.body.user_id}), req.app.models.User.findOne({_id:req.body.user_id})]
	}).spread(function(userrequest,user){
		userrequest.approval_status = CONST.APPROVAL_TYPE.APPROVED
		userrequest.approval_timestamp =  moment()
    user.write_access = true
		return [userrequest.save(), user.save()]
	}).spread(function(userrequest,user){
    res.success({userrequest,user})
  }).catch(function (err) {
    logError(err)
  }).done()
)

module.exports = router