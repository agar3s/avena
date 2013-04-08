
var express = require('express')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


mongoose.connect('mongodb://localhost/avena');
var ObjectId = mongoose.Schema.Types.ObjectId;

var FlakeSchema = new mongoose.Schema({
  datetime: { type: Date, default: Date.now },
  data:[mongoose.Schema.Types.Mixed]
});

var AvenaSchema = new mongoose.Schema({
  name: String,
  url: String,
  period: Number,
  flakes:[ObjectId]
});

var Avena = mongoose.model('Avena', AvenaSchema);

app.get('/', function(req, res){
  res.render('index');
});

app.get('/avena/', function(req, res){
  Avena.find({}, function(err, avenas){
    res.render('avena-list', {avenas: avenas});
  })
});

app.post('/avena/', function(req, res){
  var b = req.body;
  new Avena({
    name: b.name,
    url: b.url,
    period: b.period
  }).save(function(err){
    if(err) send.json(err);
    res.redirect('/avena/'+b.name)
  });
});

app.get('/avena/new', function(req, res){
  res.render('new');
});

app.get('/avena/:avena', function(req, res){
  Avena.findOne({name:req.params.avena}, function(err, avena){
    res.render('avena', {avena: avena});
  })
});



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
