var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;

var articleCounter = 1;

mongoose.connect('mongodb://localhost/blog');

var blogSchema = mongoose.Schema({
  title:  String,
  author: String,
  body:   String,
  comments: [{author: String, body: String, date: Date}],
  date: {type: Date, default: Date.now},
  hidden: Boolean,
  meta: {
    votes: Number,
    favs:  Number
  }
})

var Article = mongoose.model('Article', blogSchema);

module.exports = Article;