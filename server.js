var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Sylvester = require('sylvester');
var Kalman = require('kalman').KF;

const colors = require('colors');
const SerialPort = require('serialport');
const parsers = SerialPort.parsers;
const parser = new parsers.Readline({delimiter: '\r\n'});
const { execSync } = require("child_process");

var port = '';

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

var portstatus = {
    port: '',
    status: 'disconnected',
    gpsData: false
}

// function loop that checks for serial ports
function checkPorts() {
    var availablePorts = execSync("npx @serialport/list -f json").toString();
    availablePorts = JSON.parse(availablePorts);
    availablePorts = availablePorts.map(function(ports) {return ports.path;});
    io.emit('availablePorts', availablePorts);
    setTimeout(checkPorts, 1000);
}

checkPorts();

var serport = {isOpen: false};

function connectPort(port) {
    if (serport.isOpen) {
        serport.close();
    }
    serport = SerialPort(port, {baudRate: 9600});
    serport.pipe(parser);
    portstatus.port = port;

    serport.on("error", function (err) {
        portstatus.status = 'Error';
        io.emit('portstatus', portstatus);
        console.log(colors.red.bold('' + err));
        setTimeout(function() {connectPort(port);}, 3000);
    });
    
    serport.on('close', function() {
        portstatus.port = 'null';
        portstatus.status = 'Disconnected';
        portstatus.gpsData = false;
        io.emit('portstatus', portstatus);
        console.log(colors.red.bold(port + ' disconnected.'));
    });
    
    serport.on('open', function() {
        portstatus.status = 'Connected';
        io.emit('portstatus', portstatus);
        console.log(colors.green.bold('Connected to serial port ' + port + '.'));
    });
}

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
        portstatus.gpsData = true;
        io.emit('portstatus', portstatus);
    } else{
        portstatus.gpsData = false;
        io.emit('portstatus', portstatus);
    }
    io.emit('position', gps.state);
});

app.use(express.json());

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/favicon.ico', function(req, res) {
    res.sendFile(__dirname + '/favicon.ico');
});

// allow reading from css and js files
app.get('/css/:file', function(req, res) {
    res.sendFile(__dirname + '/css/' + req.params.file);
});

app.get('/js/:file', function(req, res) {
    res.sendFile(__dirname + '/js/' + req.params.file);
});

app.post('/settings', function (req, res) {
    console.log('Received a POST request on /settings'.yellow);
    sport = req.body.port;
    if (sport == 'null') {
        if (serport.isOpen) {
            console.log(colors.red.bold('Disconnecting from ' + port + '.'));
            serport.close();
        }
        console.log(colors.red.bold('No serial port selected.'));
    } else {
        connectPort(sport);
    }
    res.send('Got a POST request');
});

io.on('connection', function(socket) {
    try {
        if (serport.isOpen) {
            var portstatus = {
                port: port,
                status: 'connected'
            }
            io.emit('portstatus', portstatus);
        }
    } catch (e) {
        if (e.message == 'serport is not defined') {}
        else { console.log(colors.red.bold('' + e));}
    }
    
});

http.listen(3000, function() {
  console.log('Listening on port 3000'.yellow);
  console.log('To view the map, open http://localhost:3000 in your browser'.grey.italic);
});

parser.on('data', function(data) {
    try {
        gps.update(data);
    } catch (e) {
        console.log(colors.yellow('Ignoring GPS error: ' + e));
    }
});