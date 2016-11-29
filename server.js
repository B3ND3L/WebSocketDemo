
var portmqtt = '';
if(process.argv.length != 3){
  console.error('Usage : node server.js [PORT]');
  process.exit();
} else {
  let regex = /\d{4}/;
  let p = process.argv[2];
  if(p.match(regex)){
    portmqtt = p;
  } else {
    console.error('Port invalide');
    process.exit();
  }
}

import { Sensor, TimeSeries, Datum, Types, Parser } from './sensors';

var http = require('http'),
  WebSocketServer = require('ws').Server,
  express = require('express'),
  port = 1234,
  host = '0.0.0.0';

var devices = [];

var mqttURL = 'mqtt://localhost:'+portmqtt;
console.log(mqttURL);
var mqtt = require('mqtt');
var clientMQTT  = mqtt.connect(mqttURL);

// create a new HTTP server to deal with low level connection details (tcp connections, sockets, http handshakes, etc.)
var server = http.createServer();

// create a new HTTP framework to deal with high level details (routing, cookies, forms data, etc.)
var app = express();

// create a WebSocket Server on to of the HTTP server to deal with the WebSocket protocol
var wss = new WebSocketServer({
  server: server
});

// Configure the express (the http framework) to serve static files located in the 'public/' folder
app.use(express.static('public'));
server.on('request', app);

// create a function to me able do broadcast messages to all WebSocket connected clients
wss.broadcast = function broadcast(message) {
  wss.clients.forEach(function each(client) {
    client.send(message);
  });
};

// Register a listener for new connections on the WebSocket.
wss.on('connection', function(client) {

  // retrieve the name in the cookies
  var cookies = client.upgradeReq.headers.cookie.split(';');
  var wsname = cookies.find((c) => {
    return c.match(/^\s*wsname/) !== null;
  });
  wsname = wsname.split('=')[1];

  // greet the newly connected user
//  client.send('Welcome, ' + decodeURIComponent(wsname) + '!');

  // Register a listener on each message of each connection
  client.on('message', function(message) {

    var cli = '[' + decodeURIComponent(wsname) + '] ';
    console.log("message from", cli);
    // when recieving a message, broadcast it to all the connected clients
    wss.broadcast(cli + message);
  });
});


// http sever starts listenning on given host and port.
server.listen(port, host, function() {
  console.log('Listening on ' + server.address().address + ':' + server.address().port);
});

clientMQTT.subscribe('value/#');

clientMQTT.on('message', (topic, message) => {
  // message is Buffer
  let name = topic.split('/')[1];
  createSensor(name, message);

  let str = '{\"sensors\":[';
  for(let key in devices){
    str += devices[key].toJSON()+',';
  }
  str = str.substring(0,str.length-1);
  str += ']}';
  //console.log(str);
  wss.broadcast(str);
});

function createSensor(name, message){

  let json = JSON.parse(message);
  let id = 0;
  for (var x = 0; x < name.length; x++)
  {
      var c = name.charCodeAt(x);
      id += c;
  }
  let value = 0;
  if(json.type === 'ON_OFF'){
    if(json.value == 'ON') value = 1;
    else value = 0;
  } else {
    value = parseInt(json.value);
  }

  let data = new Datum(value);
  devices[name] = new Sensor(id, name, data, json.type);
  console.log('---');
}
