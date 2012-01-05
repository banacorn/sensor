{io}            = require './server'
net             = require 'net'
{EventEmitter}  = require 'events'
sms             = require('hinet-sms').createConnection()
EE = new EventEmitter

phone = ''


sms.auth '89929940', '8ae7214f'

server = net.createServer (client) ->

    console.log 'client connected'
    
    client.on 'end', ->
        console.log 'client disconnected'
        
    client.on 'error', (error) ->
        console.log error
        
    client.on 'data', (data) ->
        # console.log data.toString()
        EE.emit 'data', data.toString()

server.listen 4900

# client on connection
io.sockets.on 'connection', (socket) ->
    
    socket.emit 'phone', phone
    
    
    
    EE.on 'data', (data) ->
        socket.emit 'data', data
        
        # console.log "#{ JSON.parse data.toString()}"
        
        
        
    socket.on 'sms', ->
    
        sms.send(phone, 'Your item has been moved!! sent by MyCon-Come Text Service')
        
    socket.on 'phone', (number) ->
        console.log number
        phone = number

    
