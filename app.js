(function() {
  var EE, EventEmitter, io, net, phone, server, sms;

  io = require('./server').io;

  net = require('net');

  EventEmitter = require('events').EventEmitter;

  sms = require('hinet-sms').createConnection();

  EE = new EventEmitter;

  phone = '';

  sms.auth('89929940', '8ae7214f');

  server = net.createServer(function(client) {
    console.log('client connected');
    client.on('end', function() {
      return console.log('client disconnected');
    });
    client.on('error', function(error) {
      return console.log(error);
    });
    return client.on('data', function(data) {
      return EE.emit('data', data.toString());
    });
  });

  server.listen(4900);

  io.sockets.on('connection', function(socket) {
    socket.emit('phone', phone);
    EE.on('data', function(data) {
      return socket.emit('data', data);
    });
    socket.on('sms', function() {
      return sms.send(phone, 'Your item has been moved!! sent by MyCon-Come Text Service');
    });
    return socket.on('phone', function(number) {
      console.log(number);
      return phone = number;
    });
  });

}).call(this);
