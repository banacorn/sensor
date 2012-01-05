(function() {
  var EE, EventEmitter, io, net, server;

  io = require('./server').io;

  net = require('net');

  EventEmitter = require('events').EventEmitter;

  EE = new EventEmitter;

  server = net.createServer(function(client) {
    console.log('client connected');
    client.on('end', function() {
      return console.log('client disconnected');
    });
    client.on('error', function(error) {
      return console.log(error);
    });
    return client.on('data', function(data) {
      console.log(data.toString());
      return EE.emit('data', data.toString());
    });
  });

  server.listen(4900);

  io.sockets.on('connection', function(socket) {
    return EE.on('data', function(data) {
      return socket.emit('data', data);
    });
  });

}).call(this);
