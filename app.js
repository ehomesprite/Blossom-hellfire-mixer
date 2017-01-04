var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var stylus = require('stylus');
var routes = require('./routes/index');
var users = require('./routes/users');
var blog = require('./routes/blog');
var oti = require('./routes/oti');
var apis_blog = require('./routes/apis_blog');
var apis_lolitaur = require('./routes/apis_lolitaur');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: false }));//传图的时候加了limit
app.use(bodyParser.text({limit: '5mb'}));
app.use(cookieParser());

app.use(session({
  store: new redisStore(),
  resave: false,
  saveUninitialized: false,
  secret: "dsfn98v2n9843uwq8m4uop1iuv1923mcuriwomcqwoerqnmw09emcrq98435c89uwercmwernq9w875noqi1nvwnuqowintqwecqweriotunqoiwvtuqowietciowre",
  cookie: { maxAge: 30*86400*1000 }
}));


app.use(stylus.middleware({ 
  src: __dirname + '/public' 
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
  if(!req.session.userid){
    req.session.userid=Math.floor(Math.random()).toString(36).substr(2,10).toUpperCase();
  }
  next();
})

app.use('/', routes);
app.use('/users', users);
app.use('/blog', blog);
app.use('/oti', oti);
app.use('/apis', function(req, res, next) {  
  res.header("Access-Control-Allow-Origin", "*");  
  res.header("Access-Control-Allow-Headers", "X-Requested-With");  
  next();  
 });  
app.use('/apis/blog', apis_blog);
app.use('/apis/lolitaur', apis_lolitaur);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
