import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import { getAnalytics } from './jobs/analytics';

const app = express();
const server = http.createServer(app);

export const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

io.on('connection', (socket) => {
  console.log('A client connected');
 
  cron.schedule('*/3 * * * * *', () => getAnalytics(socket));
 
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

export default server;
