module.exports = {
	auth : require('./auth'),
	middlewares: {
    	response: require('./response'),
    	cors: require('./cors')
  	},
}