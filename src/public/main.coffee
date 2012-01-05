require.config
    paths:
        jquery: 'lib/jquery-1.7.1.min'
        raphael: 'lib/raphael-min'
        socketio: 'lib/socket.io-client-amd'
    
    
require ['jquery', 'raphael', 'socketio'], ($, Raphael, io) ->
    
    phone = ''
    
    
    class Meter
        constructor: (@data, @socket) ->
            #console.log @data
    
            html = $('#meter-template').html()
            $(html).attr('id', @data.name).appendTo '#meter'
            $("##{ @data.name } .name").text @data.name
            $("##{ @data.name } .unit").text @data.unit
            console.log $("##{ @data.name } .unit")
            
            
        add: (data) ->
        
            @data.value = data.value
            
            if data.name is 'Temperature'
                @data.value /= 100
            
        render: ->
            #console.log 'render'
            $("##{ @data.name } .digits").text @data.value
            
    
    class Wave
    
        # viewport
        height: 150
        width: 480
        
    
        constructor: (@data, @socket) ->
        
            
            
            now = new Date
            
            @data.alert = false
            @data.values = []
            
            
            @data.values.push
                time: (new Date).getTime()
                value: @data.value
            
            html = $('#chart-template').html()
            $(html).attr('id', @data.name).appendTo '#wave'
            $("##{ @data.name } .name").text @data.name
            $("##{ @data.name } .unit").text @data.unit

            @paper = Raphael "#{ @data.name }", @width, @height

           
            upperThreshold = @height - @data.upperThreshold*@height/(@data.upperBound - @data.lowerBound);
            
            
            @upperThreshold = @paper.path "M 0 #{ upperThreshold } L #{@width} #{ upperThreshold }"
            
            @upperThreshold.attr
                stroke: 'rgba(240, 160, 160, 0.5)'
                'stroke-width': 3
                
            lowerThreshold = @height - @data.lowerThreshold*@height/(@data.upperBound - @data.lowerBound);
            @lowerThreshold = @paper.path "M 0 #{ lowerThreshold } L #{@width} #{ lowerThreshold }"
            @lowerThreshold.attr
                stroke: 'rgba(240, 160, 160, 0.5)'
                'stroke-width': 3
                
            @path = @paper.path "M 0 0"
            @path.attr
                stroke: 'rgb(200, 200, 2005)'
                'stroke-width': 5
            


        add: (data) ->
        
            
        
            now = (new Date).getTime()
            @data.values.push
                time: (new Date).getTime()
                value: data.value
                name: data.name
            
            @data.values.shift() while (now - @data.values[0].time) > 3500
        
            
        
            if not @data.alert
            
                if data.value > data.upperThreshold or data.value < data.lowerThreshold
                    console.log "!!!!!!!!!"
                    @data.alert = true
                    @socket.emit 'sms'
                    
                    
                
                
            if @data.alert
                if data.value < data.upperThreshold and data.value > data.lowerThreshold
                    console.log "123123123"
                    @data.alert = false
                
        update: ->
        
            now = (new Date).getTime()
            
            for dot in @data.values
                dot.x = @width + 150 - (now - dot.time)/5 
                dot.y = @height - (dot.value - @data.lowerBound)*@height/(@data.upperBound - @data.lowerBound)         
            
        
        
        render: ->
        
            # update the coords
            @update()
        
        
        
            path = "M#{@data.values[0].x} #{@data.values[0].y} R"
            

            
            for dot in @data.values

                path += " #{dot.x} #{dot.y}"
            

            
            # console.log @data.values.length
            
            @path.attr
                'path': path
        
        
        
            
    streamList = [] 
    streams = {}
    

    # localhost:8000
    socket = io.connect()
    
    socket.on 'phone', (number) ->
        console.log number
        phone = number
        $('#sms-number').text phone
    
    socket.on 'data', (data) ->
        data = JSON.parse data
    
        
        if data is 0 then return
    
        if data.name in streamList
  
            

            streams[data.name].add data
        else
            streamList.push data.name
            console.log data
            if data.waveform is "false" then data.waveform = false else data.waveform = true
            if data.waveform 
                streams[data.name] = new Wave data, socket
            else
                streams[data.name] = new Meter data, socket
            
            
            
            
            
    setInterval( () ->
        for key, stream of streams
            stream.render()
    , 50)
            
    $ ->
    
        
        $('#sms-number').click ->
            console.log 'haha'
            $(this).hide();
            $('#sms-input').show().focus().select()
            
        foo = ->
            $('#sms-input').hide();
            $('#sms-number').show()            
            val = $('#sms-input').val()            
            $('#sms-number').text val
            console.log val
            socket.emit 'phone', val
            
        $('#sms-input').blur foo
        
        $('#sms-form').submit ->
            foo()
                
            return false
