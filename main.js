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
  console.log("start");
  for (var i = 0; i < words.length; i++) {
    let upFlag = isUpCase(words[i]) ? 1 : 0;
    var handler = upFlag ? dict.find(dict => dict.word ===
    words[i].charAt(0).toLowerCase() + words[i].slice(1)) : dict.find(dict =>
    dict.word === words[i]);
    if (typeof handler != "undefined") {
      handler = JSON.parse(JSON.stringify(handler))
      if (upFlag) {
        let upHandler = {word: handler.word.charAt(0).toUpperCase() +
        handler.word.slice(1), synonym: []};
        handler.synonym.map(function (syn) {
          upHandler.synonym.push(syn.charAt(0).toUpperCase() + syn.slice(1));
        })
        response.text.push(upHandler);
      }else{
        response.text.push(handler);
      }
    }else{
      response.text.push({word: words[i]});
    }
  }
  console.log("finish")
  return response.text
}

function isUpCase(word){
  return word.charCodeAt(0) > 64 && word.charCodeAt(0) < 91 ? true : false;
}

var listener = app.listen(process.env.PORT || 1025, function(){
  console.log('Servidor rodando na porta ' + listener.address().port);
});

app.get('/', function(req, res) {
  res.render('index.html');
});

app.post('/sendtext', function(req, res) {
  response = {
    text: []
  };
  console.log("arrived");
  getSyns(req.body.text.split(" "))
  res.send({redirect: '/response'});
});

app.get('/response', function(req, res) {
  res.render('response.html', response);
});
