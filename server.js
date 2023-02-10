var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const colors = require('colors');
const SerialPort = require('serialport');
const parsers = SerialPort.parsers;
const parser = new parsers.Readline({delimiter: '\r\n'});
const { execSync } = require("child_process");

var port = '';

var GPS = require('gps');
var gps = new GPS;

var portstatus = {
    port: '',
    status: 'disconnected',
    gpsData: false,
    printdata: false
}

var serport = {isOpen: false};

function checkPorts() {
    var availablePorts = execSync("npx @serialport/list -f json").toString();
    availablePorts = JSON.parse(availablePorts);
    availablePorts = availablePorts.map(function(ports) {return ports.path;});
    io.emit('availablePorts', availablePorts);
    setTimeout(checkPorts, 1000);
}

checkPorts();

function connectPort(sp) {
    if (serport.isOpen) {
        serport.close();
        setTimeout(function() {
            serport = SerialPort(sp, {baudRate: 9600});
            serport.pipe(parser);
            port = sp;
            portstatus.port = sp;
            serportListener(sp);
        }, 1000);
    } else {
        serport = SerialPort(sp, {baudRate: 9600});
        serport.pipe(parser);
        port = sp;
        portstatus.port = sp;
        serportListener(sp);
    }
}

function serportListener(port) {
    serport.on("error", function (err) {
        portstatus.status = 'Error';
        io.emit('portstatus', portstatus);
        console.log(colors.red.bold('' + err));
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

gps.on('data', function(data) {
    if (data.type === 'GGA' || data.type === 'GLL' || data.type === 'RMC') {
        if (data.lat && data.lon) {
            portstatus.gpsData = true;
            io.emit('portstatus', portstatus);
        } else{
            portstatus.gpsData = false;
            io.emit('portstatus', portstatus);
        }
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
        portstatus.port = 'null';
        port = 'null';
        portstatus.status = 'Disconnected';
        portstatus.gpsData = false;
        io.emit('portstatus', portstatus);
    } else {
        connectPort(sport);
    }
    if (req.body.printdata && !portstatus.printdata) {
        portstatus.printdata = true;
        console.log('Serial port data will be printed to the console.'.green.italic.bold)
        io.emit('portstatus', portstatus);
    } else if (!req.body.printdata && portstatus.printdata) {
        portstatus.printdata = false;
        console.log('Serial port data will no longer be printed to the console.'.yellow.italic.bold)
        io.emit('portstatus', portstatus);
    }
    res.send('Got a POST request');
});

app.get('/settings', function (req, res) {
    console.log('Received a GET request on /settings'.yellow);

    res.send(portstatus);
});

io.on('connection', function(socket) {
    try {
        if (serport.isOpen) {
            var portstatus = {
                port: port,
                status: 'Connected'
            }
            io.emit('portstatus', portstatus);
        }
    } catch (e) {
        if (e.message == 'serport is not defined') {}
        else { console.log(colors.red.bold('' + e));}
    }
    
});

http.listen(3000, function() {
  console.log('Listening on port '.blue + '3000'.green);
  console.log('To view the map, open http://localhost:3000 in your browser'.grey.italic);
});

parser.on('data', function(data) {
    try {
        gps.update(data);
    } catch (e) {
        console.log(colors.yellow('Ignoring GPS error: ' + e));
    }
    if (portstatus.printdata) {
        console.log(data);
    }
});