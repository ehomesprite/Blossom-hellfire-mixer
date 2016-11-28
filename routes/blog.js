var express = require('express');
var router = express.Router();

var Article = require('../sources/blogModels').Article;
var Comment = require('../sources/blogModels').Comment;
var ObjectId = require('mongoose').Schema.Types.ObjectId;

router.get('/', function(req, res){
  Article.find(function(err,data){
    if(err) return console.log(err);
    data.reverse();
    res.render('blog_list_page.jade',{ 
      title: 'Message Board', 
      header: 'Message Board', 
      articles: data
    })
  })
});
router.get('/new', function(req, res) {
  res.render('blog_newarticle_page.jade', { 
    locals: {
      title: 'New Post'
    }
  });
});

//var blogSchema = mongoose.Schema({
//  title:  String,
//  author: String,
//  body:   String,
//  comments: [{author: String, body: String, date: Date}],
//  date: {type: Date, default: Date.now},
//  hidden: Boolean,
//  meta: {
//    votes: Number,
//    favs:  Number
//  }
//})
router.post('/new', function(req, res){
  var ID = Math.random().toString(36).substr(2,10);
  var newPost = new Article({
    LID: ID,
    title: req.body.title||'No title',
    author: req.session.userid||'anonymous',
    body: req.body.body||'No content',
    comments: [],
    date: Date.now(),
    lastUpdate: Date.now(),
    hidden: false,
    meta:{
      votes: 0,
      favs: 0
    }
  });
  newPost.save(function(error, data) {
    if (error) console.log(error);
    res.redirect('/blog')
  });
});

router.get('/reply', function(req, res) {
  res.render('blog_newcomment_page.jade', { locals: {
    title: 'New Comment'
  }
  });
});

router.post('/reply', function(req, res){
  var ID = Math.random().toString(36).substr(2,10);
  var newPost = new Comment({
    LID: ID,
    title: req.body.title||'No title',
    author: req.session.userid||'anonymous',
    body: req.body.body||'No content',
    date: Date.now(),
    hidden: false,
    meta:{
      votes: 0,
      favs: 0
    }
  });
  
  Article.findOne(
    {
      "LID": req.body.id//直接使用id，不用ObjectId构造
    },
    function(err, data){
      if (err) console.log(err);
      else{
        data.comments[data.comments.length]={LID:ID};
        data.lastUpdate=Date.now();
        console.log(data);
        data.save(function(err, data) {
          if (err) console.log(err);
          newPost.save(function(err, data) {
            if (err) console.log(err);
          });
        });
      }
    }
  );
  res.redirect('/blog');
});
module.exports = router;
