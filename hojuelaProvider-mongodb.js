var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

HojuelaProvider = function(host, port) {
  this.db= new Db('node-mongo-blog', new Server(host, port, {auto_reconnect: true}, {}),{w: 1});
  this.db.open(function(){});
};


HojuelaProvider.prototype.getCollection= function(callback) {
  this.db.collection('hojuelas', function(error, hojuela_collection) {
    if(error) callback(error);
    else callback(null, hojuela_collection);
  });
};

HojuelaProvider.prototype.findAll = function(callback) {
  this.getCollection(function(error, hojuela_collection) {
    if(error) callback(error)
      else {
        hojuela_collection.find().toArray(function(error, results) {
          if(error) callback(error)
            else callback(null, results)
          });
      }
    });
};


HojuelaProvider.prototype.findById = function(id, callback) {
  this.getCollection(function(error, hojuela_collection) {
    if(error) callback(error)
      else {
        hojuela_collection.findOne({_id: hojuela_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if(error) callback(error)
            else callback(null, result)
          });
      }
    });
};

HojuelaProvider.prototype.save = function(hojuelas, callback) {
  this.getCollection(function(error, hojuela_collection) {
    if(error) callback(error)
      else {
        if( typeof(hojuelas.length)=="undefined")
          hojuelas = [hojuelas];

        for(var i=0; i<hojuelas.length; i++) {
          hojuela = hojuelas[i];
          hojuela.created_at = new Date();
          if(hojuela.comments === undefined) hojuela.comments = [];
          for(var j=0; j<hojuela.comments.length; j++) {
            hojuela.comments[j].created_at = new Date();
          }
        }

        hojuela_collection.insert(hojuelas, function() {
          callback(null, hojuelas);
        });
      }
    });
};

exports.HojuelaProvider = HojuelaProvider;