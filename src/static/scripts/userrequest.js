var userrequest ={

	getPendingRequests : function() {
    console.log('Inside pending ajax')
		return $.ajax({
         	type: 'GET',
         	url: CONSTANTS.API_BASE_URL + '/management/requests/list',
         	dataType: "json"
         });
	},

	requestAccess : function(user_id) {
       return $.ajax({
           type: 'POST',
           contentType: 'application/json',
           url: CONSTANTS.API_BASE_URL+'/management/request_access',
           dataType: "json",
           data: requestJson(user_id)
       });
	},

	approveRequest : function(user_id) {
		return $.ajax({
           type: 'POST',
           contentType: 'application/json',
           url: CONSTANTS.API_BASE_URL+'/management/approve_request',
           dataType: "json",
           data: requestJson(user_id)
       });	
	}
}

function requestJson (user_id) {
  return JSON.stringify({
      "user_id": user_id
    });
}