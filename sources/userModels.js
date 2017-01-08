var mongoose = require('mongoose');

var userModels = {};

var userConnection = mongoose.createConnection('mongodb://localhost/user');

var userSchema = mongoose.Schema({
  UID:       String,
  username:  String,
  password:  String, 
  avatar:    {type: String, default: ""},
  PLevel:    {type: Number, default: 0},
});

userSchema.index({ UID: 1, type: -1 });

userModels.User = userConnection.model('User', userSchema);

module.exports = userModels;