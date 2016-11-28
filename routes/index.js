var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.isVisit) {
  	req.session.isVisit++;
    //res.cookie('isVisit', ++req.cookies.isVisit, {maxAge: 60 * 1000});
    res.send("<p>欢迎第"+req.session.isVisit+"次访问</p>"
      +"<p>您的ID："+req.session.id+"</p>"
      +"<p>cookie"+req.session.cookie.toString()+"</p>"
      +"<p>cookie"+req.cookies.toString()+"</p>");
  } else {
    //res.cookie('isVisit', 1, {maxAge: 60 * 1000});
    req.session.isVisit=1;
    res.send("<p>欢迎第1次访问</p>"
      +"<p>您的ID："+req.session.id+"</p>");
  }
  //res.render('index', { title: "LIdy's page" });
});

module.exports = router;
