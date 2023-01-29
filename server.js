var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Sylvester = require('sylvester');
var Kalman = require('kalman').KF;

const colors = require('colors');
const SerialPort = require('serialport');
const parsers = SerialPort.parsers;
const parser = new parsers.Readline({delimiter: '\r\n'});

var file = 'COM4';

// SerialPort.list((err, ports) => {
//   for (const port of ports) {
//     console.log('Checking ${port.comName}...'.italic);
//     const sp = new SerialPort(port.comName, { baudRate: 9600 });
// 
//     sp.on("open", function () {
//       sp.on("data", function (data) {
//         const dataStr = data.toString();
//         if (dataStr.startsWith("$G")) {
//             file = port.comName;
//             sp.close();
//             return;
//         }
//       });
//     });
// 
//     sp.on("error", function (err) {
//       console.log(colors.red.bold('Serial port error: ${err}'));
//     });
//   }
// });

if (file == '') {
    console.log(colors.red.bold('No compatible serial port found.'));
    process.exit(1);
}

console.log(colors.gray('Connecting to serial port ' + file + '...'));

const port = new SerialPort(file, {baudRate: 9600});
port.pipe(parser);

var GPS = require('gps');
var gps = new GPS;

// Simple Kalman Filter set up
var A = Sylvester.Matrix.I(2);
var B = Sylvester.Matrix.Zero(2, 2);
var H = Sylvester.Matrix.I(2);
var C = Sylvester.Matrix.I(2);
var Q = Sylvester.Matrix.I(2).multiply(1e-11);
var R = Sylvester.Matrix.I(2).multiply(0.00001);

// Measure
var u = $V([0, 0]);

var filter = new Kalman($V([0, 0]), $M([[1, 0], [0, 1]]));

port.on("error", function (err) {
    console.log(colors.red.bold('' + err));
    console.log(colors.gray('Reconnecting...'));
    setTimeout(function() { port.open(); }, 2000);
});

port.on('close', function() {
    console.log(colors.red.bold(file + ' disconnected.'));
    console.log(colors.gray('Reconnecting...'));
    setTimeout(function() { port.open(); }, 2000);
});

port.on('open', function() {
    console.log(colors.green('Connected to serial port ' + file + '.'));
});

gps.on('GGA', function(data) {
    if (data.lat && data.lon) {
        filter.update({
          A: A,
          B: B,
          C: C,
          H: H,
          R: R,
          Q: Q,
          u: u,
          y: $V([data.lat, data.lon])
        });
        gps.state.position = {
          cov: filter.P.elements,
          pos: filter.x.elements
        };
      }
      io.emit('position', gps.state);
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/favicon.ico', function(req, res) {
    res.sendFile(__dirname + '/favicon.ico');
});

http.listen(3000, function() {
  console.log('Listening on port 3000'.yellow);
  console.log('To view the map, open http://localhost:3000 in your browser'.grey);
});

parser.on('data', function(data) {
    try {
        gps.update(data);
    } catch (e) {
        console.log(colors.yellow('Ignoring GPS error: ' + e));
    }
});