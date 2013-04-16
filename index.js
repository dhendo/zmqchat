var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')

var zmq = require('zmq');

app.listen(8100);

var pub = zmq.socket('pub');
var sub = zmq.socket('sub');

pub.bind('tcp://*:9000');

var reconnect = function () {

    for(var i = 1; i < 255; i++) {
        sub.connect('tcp://192.168.11.' + i + ':9000');
    }
    sub.subscribe("");
    console.log('Connected');
}

function handler(req, res) {
    var url = req.url;
    if(url == "/" || url.indexOf('../') !== -1) {
        url = '/index.html';
    }

    fs.readFile(__dirname + url, function (err, data) {
        if(err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
        res.writeHead(200);
        res.end(data);
    });
}


reconnect();

io.sockets.on('connection', function (socket) {

    sub.on('message', function (data) {

        data = data.toString();
        console.log("Received: " + data);
        socket.emit('incoming', data);
    });

    socket.on('outgoing', function (data) {
        console.log('Sending: ' + data.text);
        pub.send("Dave: " + data.text + "\n");
    });
});

