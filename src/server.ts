import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { getUsers, userJoin, userLeave } from './util/user';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'https://chat.aleksa.codes'
  }
});

io.on('connection', (socket) => {
  socket.join('myChatRoom');

  socket.on('handle-connection', (username: string) => {
    if (!userJoin(socket.id, username)) {
      socket.emit('username-taken');
    } else {
      socket.emit('username-accepted');
      io.to('myChatRoom').emit('get-connected-users', getUsers());
    }
  });

  socket.on('message', (message: { message: string; username: string }) => {
    socket.broadcast.to('myChatRoom').emit('receive-message', message);
  });

  socket.on('disconnect', () => {
    userLeave(socket.id);
    io.to('myChatRoom').emit('get-connected-users', getUsers());
  });
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});
