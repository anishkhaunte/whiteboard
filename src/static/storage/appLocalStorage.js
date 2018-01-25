
var appLocalStorage ={

	setLocalStorage : function (obj) {
		localStorage.setItem('userObj',JSON.stringify(obj))
	},

	getLocalStorage : function () {
		return JSON.parse(localStorage.getItem('userObj'))
	}
}