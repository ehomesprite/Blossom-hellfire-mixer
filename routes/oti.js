var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res) {
  fs.readdir(__dirname+'/../public/oti', function(err, files){
    for(var i=0;i<files.length;i++){
      if(!files[i].endsWith('.html')){
        files.splice(i,1);
        i--;
        //console.log(files.toString());
      }
    }
    res.render('oti_index',{title: "Dalaran oti's page", files:files});
    //var filelist = JSON.stringify(files);
    //console.log(filelist);
    res.end();
  });
});

router.post('/upload',function(req, res) {
  //console.log(req.body);
  var name = req.body.name;
  //console.log(req.body.data);
  //var data = req.body.data;
  if(name.endsWith('.html')){
    var data = req.body.data;
    fs.writeFile(__dirname+'/../public/oti/'+name, data, function(err){
      if(err) throw err;
      res.end();
      console.log('snow wrote a file called '+name);
    });
  }
  else if(name.endsWith('.js')){
    var data = req.body.data;
    fs.writeFile(__dirname+'/../public/oti/js/'+name, data, function(err){
      if(err) throw err;
      res.end();
      console.log('snow wrote a file called '+name);
    });
  }
  else if(name.endsWith('.css')){
    var data = req.body.data;
    fs.writeFile(__dirname+'/../public/oti/css/'+name, data, function(err){
      if(err) throw err;
      res.end();
      console.log('snow wrote a file called '+name);
    });
  }
  else{
    var data = new Buffer(req.body.data, 'base64');
    fs.writeFile(__dirname+'/../public/oti/img/'+name, data, function(err){
      if(err) throw err;
      res.end();
      console.log('snow wrote a file called '+name);
    });
  }
});

module.exports = router;
