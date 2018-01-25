
require('./globals')
const cluster = require('cluster')
const http = require('http')
const numCPUs = require('os').cpus().length
const config = include('config')
const socketIo = require('socket.io');
const app = require('./app')

  if (require.main === module) {
    app.listen(app.config.port, () => console.log(`Server started and listening on port ${app.config.port}`))

    const socketPort = app.config.triptrack_socket_port || 11500

    var server =  http.createServer(app);
    var io = require('socket.io')(server);
    server.listen(socketPort);
    app.set('socketIo', io)

    var line_history = [];

    // event-handler for new incoming connections
    io.on('connection', function (socket) {

      for (var i in line_history) {
          socket.emit('on_draw', { line: line_history[i] } );
      }

      socket.on('on_draw', function (data) {
          line_history.push(data.line);
          io.emit('on_draw', { line: data.line });
      });

      socket.on('on_clear', function (data) {
          line_history = [];
          io.emit('on_clear', { line: line_history[0] });
      });

    });

  } else {
    module.exports = {
      app,
      run () {
        return app.listen(app.config.port, () => console.log(`Server started and listening on port ${app.config.port}`))
      },
      shutdown () {
        return app.close()
      }
    }
  }


