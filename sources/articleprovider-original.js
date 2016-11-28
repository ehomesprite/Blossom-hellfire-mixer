var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var articleCounter = 1;

ArticleProvider = function() {};

ArticleProvider.prototype.getCollection= function(callback) {
    MongoClient.connect('mongodb://localhost:27017/blog', function(err, db) {
      if (err) {
        callback (err);
      }
      else{
        callback (null,db);
      };
	});
}
ArticleProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, db) {
      if( error ) callback(error)
      else {
        db.collection('articles').find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
      db.close();
    });
};
 

ArticleProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, db) {
      if( error ) callback(error)
      else {
        db.collection('articles').findOne({_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
      db.close();
    });
};

ArticleProvider.prototype.save = function(articles, callback) {
    this.getCollection(function(error, db) {
      if( error ) callback(error)
      else {
        if( typeof(articles.length)=="undefined")
          articles = [articles];

        for( var i =0;i< articles.length;i++ ) {
          article = articles[i];
          article.created_at = new Date();
          if( article.comments === undefined ) article.comments = [];
          for(var j =0;j< article.comments.length; j++) {
            article.comments[j].created_at = new Date();
          }
        }

        db.collection('articles').insert(articles, function() {
          callback(null, articles);
        });
      }
      db.close();
    });
};

module.exports = ArticleProvider;