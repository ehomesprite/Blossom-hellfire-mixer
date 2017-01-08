var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  if(req.session.user!==undefined){
    res.send("Welcome, "+req.session.user);
  }
  else{
    res.send("Welcome, noname");
  }
});

module.exports = router;
