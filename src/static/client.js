// Todo  1 aspect instaed of if else
// on load function to show and hide
// Access control
// Build UI
document.addEventListener("DOMContentLoaded", function() {
   var mouse = { 
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false
   };
   // get canvas element and create context
   var canvas  = document.getElementById('drawing');
   var context = canvas.getContext('2d');
   var width   = window.innerWidth;
   var height  = window.innerHeight;
   var socket  = io.connect();

   // set canvas to full browser width/height
   canvas.width = width;
   canvas.height = height;

   // register mouse event handlers
    canvas.onmousedown = function(e){ mouse.click = true; };
    canvas.onmouseup = function(e){ mouse.click = false; };

    canvas.onmousemove = function(e) {
        // normalize mouse position to range 0.0 - 1.0
        mouse.pos.x = e.clientX / width;
        mouse.pos.y = e.clientY / height;
        mouse.move = true;
    }; 
   

  	socket.on('on_draw', function (data) {
        var line = data.line;
        context.beginPath();
        context.moveTo(line[0].x * width, line[0].y * height);
        context.lineTo(line[1].x * width, line[1].y * height);
        context.stroke();
    });

    /* todo for erase
    socket.on('on_erase', function (data) {
        var line = data.line;
        context.beginPath();
        context.moveTo(line[0].x * width, line[0].y * height);
        context.lineTo(line[1].x * width, line[1].y * height);
        context.stroke();
    });*/

    socket.on('on_clear', function (data) {
      context.clearRect(0, 0, canvas.width, canvas.height);
        
    });
   
   function mainLoop() {
      // check if the user is drawing
      storage = appLocalStorage.getLocalStorage()
      //Alowing only admin and person with write access to draw

      if(storage && (storage.data.user.role == 1 || storage.data.user.write_access)) {
        if (mouse.click && mouse.move && mouse.pos_prev) {
         // send line to to the server
         socket.emit('on_draw', { line: [ mouse.pos, mouse.pos_prev ] });
         mouse.move = false;
        }
        mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
      }
      setTimeout(mainLoop, 25);

   }

   function checkLocalStorage() {
      if(localStorage) {
         //Todo put aspect instaed of if else
         if(!appLocalStorage.getLocalStorage()) {

          user.getUserList().then(function(res){
            return res;
           }).then(function(res){
            if(res.data.length === 0){
              //create an admin
              return user.createUser(1,true)
            } else {
              //create a normal user
              return user.createUser(2,false)
            }
           }).then(function(user){
              appLocalStorage.setLocalStorage(user)
              if(user.data.user.role == 1){
                showErase()
                showNotification()
              } else {
                showRequest()
              }
           })
         }
         
      } else {
         console.log('Local storage not present')
      }
   }

   onLoad();
   mainLoop();
   checkLocalStorage();
});

function onLoad(){
  storage = appLocalStorage.getLocalStorage()
  if(storage && storage.data.user.role == 1) {
    showAdminComponents()
    showPendingList()
  } else if(storage && storage.data.user.role == 2){
    showRequest()
    getUserDetails(storage.data.user.id)
  }
}

function showAdminComponents () {
  
  document.getElementById('div-eraser').style.display = 'block';
  document.getElementById('div-eraserall').style.display = 'block';
  document.getElementById('div-notification').style.display = 'block';
  document.getElementById('div-pencil').style.display = 'block';

  document.getElementById('btn-eraser').style.display = 'block';
  document.getElementById('btn-eraserall').style.display = 'block';
  document.getElementById('btn-notification').style.display = 'block';
  document.getElementById('btn-pencil').style.display = 'block';

  document.getElementById("btn-eraser").addEventListener("click", eraser);
  document.getElementById("btn-eraserall").addEventListener("click", eraserall);
  document.getElementById("btn-pencil").addEventListener("click", pencil);

}


function showRequest() {
  document.getElementById('div-access').style.display = 'block';
  document.getElementById('btn-access').style.display = 'block';
  document.getElementById("btn-access").addEventListener("click", requestAccess);
}

function getUserDetails (user_id){
  user.getUserDetails(user_id).then(function(res){
    return res
  }).then(function(res){
    console.log('the response')
    console.log(res.data)
    if(res.data && res.data.user.role == 2 && res.data.user.write_access){
      console.log('update user details in local storage')
      appLocalStorage.setLocalStorage(res)
    }
  })
}

function requestAccess() {
    console.log('request access');
    // Get userid from local storage and send for request access
     storage = appLocalStorage.getLocalStorage()
     if(storage && storage.data.user.role != 1) {
      userrequest.requestAccess(storage.data.user.id).then(function(userrequest){
        return userrequest
      }).then(function(userrequest){
        console.log('the userrequest')
        console.log(userrequest)
      })  
    }    
}

function approveUser(user_id) {
    // Get userid from local storage and send for request access
    userrequest.approveRequest(user_id).then(function(userrequest){
      return userrequest
    }).then(function(res){
      console.log('the approved userrequest')
      console.log(userrequest)
    })  
        
}

function showPendingList(){
  console.log('in pending list')
  storage = appLocalStorage.getLocalStorage()
  if(storage && storage.data.user.role == 1) {
    userrequest.getPendingRequests().then(function(userrequest){
      return userrequest
    }).then(function(res){
      console.log('res')
      console.log(res)
      if(res.data.length>0){
        var ul = document.getElementById("dynamic-list");
        var li = document.createElement("li");
        li.setAttribute('id',res.data[0].user_id);
        li.setAttribute('class','collection-item');
        li.appendChild(document.createTextNode(res.data[0].user_id+ ' has requested write access.'));
       // li.bind('click',myClick);
        $("#dynamic-list").on("click", "li", approveClick);
        ul.appendChild(li);  
      }
      
    })
  }
}

function approveClick(e){
  approveUser($(this).attr('id'))
  //console.log(e.getAttribute('id'))
}

//Only admin sees the below functions
function eraser(){                 
    var canvas  = document.getElementById('drawing');
    var context = canvas.getContext('2d');             
    context.strokeStyle = "rgb(255, 255, 255)";
    context.globalCompositeOperation = "destination-out";  
    //context.strokeStyle = ("rgba(255,255,255,255)");
    // or
    context.fillStyle = "rgba(255,0,0,0)";
}

function pencil(){
  var canvas  = document.getElementById('drawing');
  var context = canvas.getContext('2d');             
  context.globalCompositeOperation = "source-over";
  context.strokeStyle = "rgb(0, 0, 0)";
}

function eraserall(){     
    var canvas  = document.getElementById('drawing');
    var context = canvas.getContext('2d');  
    context.clearRect(0, 0, canvas.width, canvas.height);
    var socket  = io.connect();
    socket.emit('on_clear', { line: [ ] });
}
