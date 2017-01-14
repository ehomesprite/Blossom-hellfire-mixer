var express = require('express');
var router = express.Router();
var crypto = require('crypto');

var rClient = require('redis').createClient();
rClient.on('error', function (err) {
    console.log('Error ' + err);
});

router.post('/token', function(req, res){
	if(req.session.user!==undefined){
		rClient.get('chat:userToken:'+req.session.user.UID, function (err, replies){
			if(replies===null){
				crypto.randomBytes(16,function(err, buffer) {
				  var token = buffer.toString('hex');
					rClient.set('chat:userToken:'+req.session.user.UID, token);
					rClient.expire('chat:userToken:'+req.session.user.UID, 30);
					rClient.set('chat:tokenUser:'+token, JSON.stringify(req.session.user));
					rClient.expire('chat:tokenUser:'+token, 30);
					res.json({uid: req.session.user.UID, username: req.session.user.UID, token: token});
    			console.log('token sent');
				});
			}
			else{
			  res.json({uid: req.session.user.UID, username: req.session.user.UID, token: replies});
				//res.json({error: 101, errorText: 'token already exist'});
    		console.log('token exist');
			}
		})
	}
	else{
		res.json({error: 100, errorText: 'user not logged in'});
    console.log('user invalid');
	}
})


//io.emit === broadcast to all
//socket.broadcast.emit === broadcast except self


var ioResponse = function(io){
	var onlineUsers = [];
  io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('signIn', function(token){
    	rClient.get('chat:tokenUser:'+token, function (err, user){
    		console.log(token);
    		console.log(user);
    		if(user!==null){
    			socket.token = token;
    			socket.user = JSON.parse(user);
    			console.log(socket.user.username+' signed in');
    			onlineUsers.push(user);
      		io.emit('userList', onlineUsers);
    		}
    		else{
    			socket.emit('chatError', 'Invalid token');
    		}
    	});
    });
    socket.on('message', function(data){
    	if(socket.user!==undefined){
    		rClient.get('chat:tokenUser:'+socket.token,  function (err, replies){
    			if(replies!==null){
	      		socket.broadcast.emit('message', {uid:socket.user.uid, username:socket.user.username, msg:data});
						rClient.expire('chat:userToken:'+socket.user.UID, 2*3600);
						rClient.expire('chat:tokenUser:'+socket.token, 2*3600);
    			}
    			else{
    				socket.emit('chatError', {error: 200, errorText:'token expired'})
    			}
				});
    	}
    });
    socket.on('disconnect', function(){
      console.log('user disconnected');
	    if(socket.token!==undefined){
		    rClient.del('chat:userToken:'+socket.user.UID);
		    rClient.del('chat:tokenUser:'+socket.token);
      	console.log(socket.user.username+' signed out');
		  	onlineUsers.splice(onlineUsers.indexOf(socket.user),1);
		    io.emit('userList', onlineUsers);
		  }
		  else{
		  	console.log('token error. check for sync problems(user)');
		  }
    });
  });
}


module.exports = {router: router, socket: ioResponse};
