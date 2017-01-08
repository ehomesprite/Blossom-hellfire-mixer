var express = require('express');
var router = express.Router();


var ioResponse = function(io){
  io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('chat message', function(msg){
      io.emit('chat message', msg);
    });
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });
}


module.exports = {router: router, socket: ioResponse};
