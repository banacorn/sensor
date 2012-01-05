{io}            = require './server'
net             = require 'net'
{EventEmitter}  = require 'events'

EE = new EventEmitter




server = net.createServer (client) ->

    console.log 'client connected'
    
    client.on 'end', ->
        console.log 'client disconnected'
        
    client.on 'error', (error) ->
        console.log error
        
    client.on 'data', (data) ->
        console.log data.toString()
        EE.emit 'data', data.toString()

server.listen 4900

# client on connection
io.sockets.on 'connection', (socket) ->
    
    EE.on 'data', (data) ->
        socket.emit 'data', data

    
