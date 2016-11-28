var mongoose = require('mongoose');

var lolitaurModels = {};

var lolitaurConnection = mongoose.createConnection('mongodb://localhost/lolitaur');

var postSchema = mongoose.Schema({
  LID:        String,
  section:    String,
  title:      String,
  author:     String,
  body:       String,
  repos:      {type: [{LID: String}], default: []},
  tweets:     {type: [{LID: String}], default: []},
  image:      {type: String, default: ""},
  date:       {type: Date, default: Date.now},
  lastUpdate: {type: Date, default: Date.now},
  hidden:     {type: Boolean, default: false},
  meta: {
    votes:    {type: Number, default: 0},
    favs:     {type: Number, default: 0}
  }
});

var repoSchema = mongoose.Schema({
  LID:     String,
  title:   String,
  author:  String,
  body:    String,
  tweets:  {type: [{LID: String}], default: []},
  image:   {type: String, default: ""},
  date:    {type: Date, default: Date.now},
  hidden:  {type: Boolean, default: false},
  meta: {
    votes: {type: Number, default: 0}
  }
});

var tweetSchema = mongoose.Schema({
  LID:     String,
  author:  String,
  body:    String,
  date:    {type: Date, default: Date.now},
  hidden:  {type: Boolean, default: false},
  meta: {
    votes: {type: Number, default: 0}
  }
});

postSchema.index({ lastUpdate: 1, type: -1 });
repoSchema.index({ date: 1, type: -1 });
tweetSchema.index({ date: 1, type: -1 });

lolitaurModels.Post = lolitaurConnection.model('Post', postSchema);
lolitaurModels.Repo = lolitaurConnection.model('Repo', repoSchema);
lolitaurModels.Tweet = lolitaurConnection.model('Tweet', tweetSchema);

module.exports = lolitaurModels;