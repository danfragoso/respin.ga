var express = require('express');
var fs = require('fs');
var nunjucks = require('nunjucks');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var dict = JSON.parse(fs.readFileSync('./syns', 'utf8'));

var response = {
  text: []
};

nunjucks.configure('web', {
  autoescape: true,
  express: app
});

function getSyns(words){
  for (var i = 0; i < words.length; i++) {
    var handler = dict.find(dict => dict.word === words[i])
    if (typeof handler != "undefined") {
      handler = JSON.parse(JSON.stringify(handler))
      response.text.push(handler);
    }else{
      response.text.push({word: words[i]});
    }
  }
  console.log("ready.")
  return response.text
}

var listener = app.listen(process.env.PORT || 1025, function(){
  console.log('Servidor rodando na porta ' + listener.address().port);
});

app.get('/', function(req, res) {
  res.render('index.html');
  response = {
    text: []
  };
});

app.post('/sendtext', function(req, res) {
  getSyns(req.body.text.split(" "))
  res.send({redirect: '/response'});
});

app.get('/response', function(req, res) {
  res.render('response.html', response);
});
