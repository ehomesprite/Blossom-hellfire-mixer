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

/* Get sections list */
var sections = ["admin","pony","javascript","anime","tenhou"];

router.get('/sections', function(req, res) {
  res.json(sections);
});

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
    find({"section":req.params.section}).
    skip(postsInAPage*(req.params.page-1)).
    limit(postsInAPage).
    select({section: 0,repos: 0}).
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

router.post('/posts/new/:section', function(req, res){
  if(!Lutil.TextValidator(req.body.body)) res.sendStatus(400);
  var ID = Math.random().toString(36).substr(2,10);
  var newPost = new Post({
    LID: ID,
    title: req.body.title||'No title',
    section: req.params.section||'',
    author: req.session.userid||'anonymous',
    body: req.body.body||'No content',
    image: req.body.image||'',
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
    if(req.params.page<=0||(req.params.page-1)*reposInAPage>data.repos.length){
      res.sendStatus(400);
      return;
    }
    var idList=[];
    for(var i=0; i<data.repos.length; i++){
      idList[i]=data.repos[i].LID;
    }
    Repo.
    find({"LID": {$in: idList}}).
    skip(reposInAPage*(req.params.page-1)).
    limit(reposInAPage).
    select({tweets: 0}).
    //sort({date: -1}).
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

router.post('/repos/new/:postID', function(req, res){
  if(!Lutil.TextValidator(req.body.body)) res.sendStatus(400);
  var ID = Math.random().toString(36).substr(2,10);
  var newRepo = new Repo({
    LID: ID,
    title: req.body.title||'No title',
    author: req.session.userid||'anonymous',
    body: req.body.body||'No content',
    image: req.body.image||'',
  });
  
  Post.
  findOne({"LID": req.params.postID}).
  exec(function(err, data){
    if (err) {
      res.sendStatus(500);
      return console.log(err);
    }
    data.repos.push({LID:ID});
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

router.get('/tweets/:repoID/:page', function(req, res) {
  var idList=[];
  Repo.
  findOne({"LID": req.params.postID}).
  select('tweets').
  exec(function(err,data){
    if(err) {
      res.sendStatus(500);
      return console.log(err);
    }
    if(req.params.page<=0||(req.params.page-1)*reposInAPage>data.tweets.length){
      res.sendStatus(400);
      return;
    }
    for(var i=0; i<data.tweets.length; i++){
      idList[i]=data.tweets[i].LID;
    }
    Tweet.
    find({"LID": {$in: idList}}).
    skip(reposInAPage*(req.params.page-1)).
    limit(reposInAPage).
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

router.post('/tweets/new/:repoID', function(req, res){
  if(!Lutil.TextValidator(req.body.body)) res.sendStatus(400);
  var ID = Math.random().toString(36).substr(2,10);
  var newTweet = new Tweet({
    LID: ID,
    title: req.body.title||'No title',
    author: req.session.userid||'anonymous',
    body: req.body.body||'No content',
  });
  
  Repo.
  findOne({"LID": req.params.repoID}).
  exec(function(err, data){
    if (err) {
      res.sendStatus(500);
      return console.log(err);
    }
    data.tweets[data.tweets.length]={LID:ID};
    data.lastUpdate=Date.now();
    data.save(function(err, data) {
      if (err) {
        res.sendStatus(500);
        return console.log(err);
      }
      newTweet.save(function(err, data) {
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
