
var express = require('express')
  , http = require('http')
  , path = require('path')
  , request = require('request')
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
  datetime: {type: Date, default: Date.now },
  data:{type: mongoose.Schema.Types.Mixed}
});

var AvenaSchema = new mongoose.Schema({
  name: String,
  url: String,
  period: Number,
  variable: String,
  flakes:[{type:mongoose.Schema.Types.ObjectId, ref:'Flake'}]
});

var Avena = mongoose.model('Avena', AvenaSchema);
var Flake = mongoose.model('Flake', FlakeSchema);

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
    period: b.period,
    variable: b.variable
  }).save(function(err){
    if(err) send.json(err);
    res.redirect('/avena/'+b.name)
  });
});

app.get('/avena/new', function(req, res){
  res.render('new');
});

app.get('/avena/:avena', function(req, res){
  Avena.findOne({name:req.params.avena})
    .populate('flakes')
    .exec(function(err, avena){
      res.render('avena', {avena: avena});
  })
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//track the urls
var tracks = function(){
  console.log('a loop');
  Avena.find({}, function(err, avenas){
    for(i in avenas){
      avena = avenas[i];
      request(avena.url, function (error, response, body) {
        console.log(response.statusCode);
        if (!error && response.statusCode == 200) {
          dataCrude = JSON.parse(body); // Print the google web page.
          variable = {};
          variable[avena.variable] = dataCrude[avena.variable];
          flake = new Flake({
            data:variable,
            datetime: new Date().getTime()
          });
          flake.save(function(err){
            if(err){
              console.log(err);
            }
            if(!err){
              avena.flakes.push(flake);
              avena.save();
            }
          });
        }
      });
    }
  });
};

(function loop(){
  tracks();
  setTimeout(loop, 60000);
})();