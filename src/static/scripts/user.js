

var user ={

	getUserList : function (){
		console.log('inside user list')
		return $.ajax({
         type: 'GET',
         url: CONSTANTS.API_BASE_URL + '/users/',
         dataType: "json"
      	});
	},

	getUserDetails: function(user_id){
		return $.ajax({
         type: 'GET',
         url: CONSTANTS.API_BASE_URL + '/users/' + user_id,
         dataType: "json"
         });
	},

	createUser : function(role,write_access){
       return $.ajax({
           type: 'POST',
           contentType: 'application/json',
           url: CONSTANTS.API_BASE_URL+'/users',
           dataType: "json",
           data: userJson(role,write_access)
       });
	}
}

function userJson (role,write_access) {
	return JSON.stringify({
    	"first_name": 'ABC',
    	"last_name": 'XYZ',
    	"role": role,
      "write_access": write_access
    });
}