var express = require('express');
var router = express.Router();

var Post = require('../sources/lolitaurModels').Post;
var Repo = require('../sources/lolitaurModels').Repo;
var Tweet = require('../sources/lolitaurModels').Tweet;

var postsInAPage = 6;
var reposInAPage = 10;
var tweetsInAPage = 10;

/* Public functions */

var Lutil={};

Lutil.TextValidator = function(text){
  var wspace = text.match(/./g);
  var nwspace = text.match(/\S/g);

  if(wspace===null||nwspace===null){
    return "";
  }
  else if(wspace.length>500){
    return ""
  }
  else{
    return text.replace(/[<>&]/,function(match){
      switch(match){
        case "<":{
          return "&#60;";
        }
        case ">":{
          return "&#62;";
        }
        case "&":{
          return "&#38;";
        }
      }
    });
  }
}

/* Get the number of pages for all elements */

router.get('/posts/pageCount', function(req, res) {
  Post.
  count().
  exec(function(err,count){
    res.json(Math.ceil(count/postsInAPage));
  })
});

router.get('/repos/:poID/pageCount', function(req, res) {
  Post.
  findOne({"LID": req.params.poID}).
  select({repos: 1}).
  exec(function(err,data){
    res.json(Math.ceil(data.repos.length/reposInAPage));
  })
});

router.get('/tweets/:poID/pageCount', function(req, res) {
  Post.
  findOne({"LID": req.params.poID}).
  select({tweets: 1}).
  exec(function(err,data){
    if(data.tweets.length){
      res.json(Math.ceil(data.tweets.length/tweetsInAPage));
    }
    else{
      Repo.
      findOne({"LID": req.params.poID}).
      select({tweets: 1}).
      exec(function(err,data){
        if(data.tweets.length){
          res.json(Math.ceil(data.tweets.length/tweetsInAPage));
        }
      });
    }
  });
});

/* GET posts by page (6 per page) */

router.get('/posts/:section/:page', function(req, res) {
  Post.
  count().
  exec(function(err,count){
    if(err) {
        res.sendStatus(500);
        return console.log(err);
      };
    if(req.params.page<=0||(req.params.page-1)*postsInAPage>count){
      res.sendStatus(400);
      return;
    }
    Post.
    find().
    skip(postsInAPage*(req.params.page-1)).
    limit(postsInAPage).
    select({section: 0,repos: 0,comments: 0}).
    sort({lastUpdate: -1}).
    exec(function(err,data){
      if(err) {
        res.sendStatus(500);
        return console.log(err);
      }
      res.json(data);
    });
  })
});

/* Post a new post*/

router.post('/posts/:section/new', function(req, res){
  if(!Lutil.TextValidator(req.body.body)) res.sendStatus(400);
  var ID = Math.random().toString(36).substr(2,10);
  var newPost = new Post({
    LID: ID,
    title: req.body.title||'No title',
    author: req.session.userid||'anonymous',
    body: req.body.body||'No content',
  });
  newPost.save(function(err, data) {
    if (err) {
      res.sendStatus(500);
      return console.log(err);
    }
    res.end();
  });
});

/* GET repos of specific postID by page (10 per page) */

router.get('/repos/:postID/:page', function(req, res) {
  Post.
  findOne({"LID": req.params.postID}).
  select('repos').
  exec(function(err,data){
    if(err) {
        res.sendStatus(500);
        return console.log(err);
      }
    if(req.params.page<=0||(req.params.page-1)*reposInAPage>data.comments.length){
      res.sendStatus(400);
      return;
    }
    var idList=[];
    for(var i=0; i<data.comments.length; i++){
      idList[i]=data.comments[i].LID;
    }
    Repo.
    find({"LID": {$in: idList}}).
    skip(reposInAPage*(req.params.page-1)).
    limit(reposInAPage).
    select({comments: 0}).
    sort({date: -1}).
    exec(function(err,data){
      if(err) {
        res.sendStatus(500);
        return console.log(err);
      }
      res.json(data);
    });
  });
});

/* Post a new repo*/

router.post('/repos/:postID/new', function(req, res){
  if(!Lutil.TextValidator(req.body.body)) res.sendStatus(400);
  var ID = Math.random().toString(36).substr(2,10);
  var newRepo = new Repo({
    LID: ID,
    title: req.body.title||'No title',
    author: req.session.userid||'anonymous',
    body: req.body.body||'No content',
  });
  
  Post.
  findOne({"LID": req.params.postID}).
  exec(function(err, data){
    if (err) {
      res.sendStatus(500);
      return console.log(err);
    }
    data.comments.push({LID:ID});
    data.lastUpdate=Date.now();
    data.save(function(err, data) {
      if (err) {
        res.sendStatus(500);
        return console.log(err);
      }
      newRepo.save(function(err, data) {
        if (err) {
          res.sendStatus(500);
          return console.log(err);
        }
      });
    });
  });
  res.end();
});

/* GET tweets of specific postID or repoID by page (10 per page) */

router.get('/tweets/:poID/:page', function(req, res) {
  var idList=[];
  Post.
  findOne({"LID": req.params.postID}).
  select('tweets').
  exec(function(err,data){
    if(err) {
        res.sendStatus(500);
        return console.log(err);
      }
    if(data.tweets.length){
      if(req.params.page<=0||(req.params.page-1)*reposInAPage>data.comments.length){
        res.sendStatus(400);
        return;
      }
      for(var i=0; i<data.comments.length; i++){
        idList[i]=data.comments[i].LID;
      }
    }
    else{
      Repo.
      findOne({"LID": req.params.postID}).
      select('tweets').
      exec(function(err,data){
        if(err) {
          res.sendStatus(500);
          return console.log(err);
        }
        if(req.params.page<=0||(req.params.page-1)*reposInAPage>data.comments.length){
          res.sendStatus(400);
          return;
        }
        for(var i=0; i<data.comments.length; i++){
          idList[i]=data.comments[i].LID;
        }
      });
    }
    Tweet.
    find({"LID": {$in: idList}}).
    skip(reposInAPage*(req.params.page-1)).
    limit(reposInAPage).
    select({comments: 0}).
    sort({date: -1}).
    exec(function(err,data){
      if(err) {
        res.sendStatus(500);
        return console.log(err);
      }
      res.json(data);
    });
  });
});

/* Post a new repo*/

router.post('/tweets/:poID/new', function(req, res){
  if(!Lutil.TextValidator(req.body.body)) res.sendStatus(400);
  var ID = Math.random().toString(36).substr(2,10);
  var newRepo = new Repo({
    LID: ID,
    title: req.body.title||'No title',
    author: req.session.userid||'anonymous',
    body: req.body.body||'No content',
  });
  
  Post.
  findOne({"LID": req.params.postID}).
  exec(function(err, data){
    if (err) {
      res.sendStatus(500);
      return console.log(err);
    }
    data.comments[data.comments.length]={LID:ID};
    data.lastUpdate=Date.now();
    data.save(function(err, data) {
      if (err) {
        res.sendStatus(500);
        return console.log(err);
      }
      newRepo.save(function(err, data) {
        if (err) {
          res.sendStatus(500);
          return console.log(err);
        }
      });
    });
  });
  res.end();
});

module.exports = router;
