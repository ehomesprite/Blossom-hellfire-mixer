var express = require('express');
var router = express.Router();
var User = require('../sources/userModels').User;

var UID;

User.findOne().exec(function(err,user){
  if(user===null){
    UID = 1;
  }
  else{
    UID = user.UID+1;
  }
});



/* GET users listing. */
router.get('/login', function(req, res) {
  if(req.session.user!==undefined){
    res.redirect("/");
  }
  else{
    res.render("site_login",{title: "\u767b\u5f55"});
  }
});

router.post('/login', function(req, res) {
  if(req.session.user!==undefined){
    res.redirect("/");
  }
  else{
    User.
    findOne({username: req.body.username}).
    exec(function(err,user){
      if(user===null){
        res.render("site_login",{title: "\u767b\u5f55", errDisplay:"block", errText:"User not exist."});
      }
      else if(req.body.password!==user.password){
        res.render("site_login",{title: "\u767b\u5f55", username:req.body.username, errDisplay:"block", errText:"Wrong password."});
      }
      else{
        req.session.user=user;
        if(req.body.remember==="on"){
          req.session.cookie.maxAge = 7*86400*1000;
        }
        res.redirect("/");
        //res.render("site_login",{title: "\u767b\u5f55", succDisplay:"block", succText:"Login success."});
      }
    })
  }
});

router.get('/register', function(req, res) {
  if(req.session.user!==undefined){
    res.redirect("/");
  }
  else{
    res.render("site_register",{title: "\u6ce8\u518c"});
  }
});

router.post('/register', function(req, res) {
  if(req.session.user!==undefined){
    res.redirect("/");
  }
  else{
    if(req.body.username.length<4){
      res.render(
      "site_register",{title: "\u6ce8\u518c", errDisplay:"block", errText:"Username too short (at least 4 chracters)."});

    }
    else if(req.body.password.length<6){
      res.render(
      "site_register",{title: "\u6ce8\u518c", errDisplay:"block", errText:"Password too short (at least 6 chracters)."});

    }
    else if(req.body.terms!=="on"){
      res.render(
      "site_register",{title: "\u6ce8\u518c", errDisplay:"block", errText:"Must accept terms."});
    }
    else{
      User.
      findOne({username: req.body.username}).
      exec(function(err,user){
        if(user!==null){
          res.render("site_register",{title: "\u6ce8\u518c", errDisplay:"block", errText:"Username exist."});
          res.end();
        }
        else{
          var newUser = new User({
            UID: UID++,
            username: req.body.username,
            password: req.body.password
          })
          newUser.save(function(err, data) {
            if (err) {
              res.sendStatus(500);
              return console.log(err);
            }
            res.redirect("/users/login");
          });
        }
      })
    }
  }
});


module.exports = router;
