const mongo = require('mongodb').MongoClient;

const client = require('socket.io').listen(4000).sockets;


mongo.connect('mongodb://127.0.0.1/oki', function (err, db) {
    if (err) {
        throw err;
    }


    console.log('Mongodb Connected');

    //Connect ot socket.io

    client.on('connection', function (socket) {
        let chat = db.collection('chats');


        //Create function to send status

        sendStatus = function (s) {
            socket.emit('status', s);
        }

        //Get chat list

        chat.find().limit(100).sort({ _id: 1 }).toArray(function (err, res) {
            if (err) {
                throw err;
            }

            //Send Messages out
            socket.emit('output', res);
        });

        //Handle Input Events;

        socket.on('input', function (data) {
            let name = data.name;
            let message = data.message;
            //Check for name and msg

            if (name == '' || message == '') {
                sendStatus('Please enter a name and a message')
            }
            else {
                chat.insert({
                    name: name,
                    message: message
                }, function () {
                    client.emit('output', [data]);

                    //Send Status object

                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    })
                });
            }
        });


        //Handle Clear

        socket.on('clear', function (data) {
            //Remove all chats from collection
            chat.remove({}, function () {
                socket.emit('cleared');
            })
        })


    });






});