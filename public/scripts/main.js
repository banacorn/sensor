(function() {
  var __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  require.config({
    paths: {
      jquery: 'lib/jquery-1.7.1.min',
      raphael: 'lib/raphael-min',
      socketio: 'lib/socket.io-client-amd'
    }
  });

  require(['jquery', 'raphael', 'socketio'], function($, Raphael, io) {
    var Meter, Wave, socket, streamList, streams;
    Meter = (function() {

      function Meter(data) {
        var html;
        this.data = data;
        html = $('#meter-template').html();
        $(html).attr('id', this.data.name).appendTo('#meter');
        $("#" + this.data.name + " .name").text(this.data.name);
        $("#" + this.data.name + " .unit").text(this.data.unit);
        console.log($("#" + this.data.name + " .unit"));
      }

      Meter.prototype.add = function(data) {
        this.data.value = data.value;
        if (data.name === 'Temperature') return this.data.value /= 100;
      };

      Meter.prototype.render = function() {
        return $("#" + this.data.name + " .digits").text(this.data.value);
      };

      return Meter;

    })();
    Wave = (function() {

      Wave.prototype.height = 150;

      Wave.prototype.width = 480;

      function Wave(data) {
        var html, lowerThreshold, now, upperThreshold;
        this.data = data;
        now = new Date;
        this.data.values = [];
        this.data.values.push({
          time: (new Date).getTime(),
          value: this.data.value
        });
        html = $('#chart-template').html();
        $(html).attr('id', this.data.name).appendTo('#wave');
        $("#" + this.data.name + " .name").text(this.data.name);
        $("#" + this.data.name + " .unit").text(this.data.unit);
        this.paper = Raphael("" + this.data.name, this.width, this.height);
        upperThreshold = this.height - this.data.upperThreshold * this.height / (this.data.upperBound - this.data.lowerBound);
        this.upperThreshold = this.paper.path("M 0 " + upperThreshold + " L " + this.width + " " + upperThreshold);
        this.upperThreshold.attr({
          stroke: 'rgba(240, 160, 160, 0.5)',
          'stroke-width': 3
        });
        lowerThreshold = this.height - this.data.lowerThreshold * this.height / (this.data.upperBound - this.data.lowerBound);
        this.lowerThreshold = this.paper.path("M 0 " + lowerThreshold + " L " + this.width + " " + lowerThreshold);
        this.lowerThreshold.attr({
          stroke: 'rgba(240, 160, 160, 0.5)',
          'stroke-width': 3
        });
        this.path = this.paper.path("M 0 0");
        this.path.attr({
          stroke: 'rgb(200, 200, 2005)',
          'stroke-width': 5
        });
      }

      Wave.prototype.add = function(data) {
        var now, _results;
        now = (new Date).getTime();
        this.data.values.push({
          time: (new Date).getTime(),
          value: data.value,
          name: data.name
        });
        _results = [];
        while ((now - this.data.values[0].time) > 3500) {
          _results.push(this.data.values.shift());
        }
        return _results;
      };

      Wave.prototype.update = function() {
        var dot, now, _i, _len, _ref, _results;
        now = (new Date).getTime();
        _ref = this.data.values;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dot = _ref[_i];
          dot.x = this.width + 150 - (now - dot.time) / 5;
          _results.push(dot.y = this.height - (dot.value - this.data.lowerBound) * this.height / (this.data.upperBound - this.data.lowerBound));
        }
        return _results;
      };

      Wave.prototype.render = function() {
        var dot, path, _i, _len, _ref;
        this.update();
        path = "M" + this.data.values[0].x + " " + this.data.values[0].y + " R";
        _ref = this.data.values;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dot = _ref[_i];
          path += " " + dot.x + " " + dot.y;
        }
        return this.path.attr({
          'path': path
        });
      };

      return Wave;

    })();
    streamList = [];
    streams = {};
    socket = io.connect();
    socket.on('data', function(data) {
      var _ref;
      data = JSON.parse(data);
      if (data === 0) return;
      if (_ref = data.name, __indexOf.call(streamList, _ref) >= 0) {
        return streams[data.name].add(data);
      } else {
        streamList.push(data.name);
        console.log(data);
        if (data.waveform === "false") {
          data.waveform = false;
        } else {
          data.waveform = true;
        }
        if (data.waveform) {
          return streams[data.name] = new Wave(data);
        } else {
          return streams[data.name] = new Meter(data);
        }
      }
    });
    return setInterval(function() {
      var key, stream, _results;
      _results = [];
      for (key in streams) {
        stream = streams[key];
        _results.push(stream.render());
      }
      return _results;
    }, 50);
  });

}).call(this);
