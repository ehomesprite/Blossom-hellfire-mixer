var mongoose = require('mongoose');

var blogModels = {};

var blogConnection = mongoose.createConnection('mongodb://localhost/blog');

var articleSchema = mongoose.Schema({
  LID:    String,
  title:  String,
  author: String,
  body:   String,
  comments: [{LID: String}],
  date: {type: Date, default: Date.now},
  lastUpdate: Date,
  hidden: Boolean,
  meta: {
    votes: Number,
    favs:  Number
  }
});

var commentSchema = mongoose.Schema({
  LID:    String,
  author: String,
  body:   String,
  date: {type: Date, default: Date.now},
  hidden: Boolean,
  meta: {
    votes: Number
  }
});

blogModels.Article = blogConnection.model('Article', articleSchema);
blogModels.Comment = blogConnection.model('Comment', commentSchema);

module.exports = blogModels;