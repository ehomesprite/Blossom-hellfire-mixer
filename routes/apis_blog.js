var express = require('express');
var router = express.Router();

var Article = require('../sources/blogModels').Article;
var Comment = require('../sources/blogModels').Comment;

var articlesInAPage = 6;
var commentsInAPage = 20;

/* GET articles and comments */

router.get('/article/totalPage', function(req, res) {
  Article.
  count().
  exec(function(err,count){
    res.json(Math.ceil(count/6));
  })
});


router.get('/article/:page', function(req, res) {
  Article.
  count().
  exec(function(err,count){
    if(err) return console.log(err);
    if(req.params.page<=0||(req.params.page-1)*articlesInAPage>count){
      res.sendStatus(400);
      return;
    }
    Article.
    find().
    skip(articlesInAPage*(req.params.page-1)).
    limit(articlesInAPage).
    select({comments: 0}).
    //sort({lastUpdate: -1}).   //no need to sort for a blog
    exec(function(err,data){
      if(err) return console.log(err);
      res.json(data);
    });
  })
});


router.post('/article/new', function(req, res){
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
    res.end();
  });
});

router.get('/comment/:id/:page', function(req, res) {
  Article.
  findOne({"LID": req.params.id}).
  select('comments').
  exec(function(err,data){
    if(err) return console.log(err);
    if(req.params.page<=0||(req.params.page-1)*commentsInAPage>data.comments.length){
      res.sendStatus(500);
      return;
    }
    var cids=[];
    for(var i=0; i<data.comments.length; i++){
      cids[i]=data.comments[i].LID;
    }
    Comment.find({"LID": {$in: cids}}).
    skip(commentsInAPage*(req.params.page-1)).
    limit(commentsInAPage).
    exec(function(err,data){
      if(err) return console.log(err);
      data.reverse();
      res.json(data);
    });
  });
});
router.post('/comment/new', function(req, res){
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
  res.end();
});
module.exports = router;
