import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { cassandraClient } from './config';

const app = express();
const server = http.createServer(app);

export const io = new Server(server);

app.get('/health', (req, res) => {
  res.sendStatus(200);
});


io.on('connection', (socket) => {
  console.log('A client connected');

  cassandraClient
    .execute('SELECT * FROM weather_data.temperature_data', [], { prepare: true })
    .then((result) => {
      const data = result.rows.map((row) => row.get('column_name'));

      console.log("data:::::::::::", data);

      socket.emit('data', data);
    })
    .catch((error) => {
      console.error('Error retrieving data from Cassandra:', error);
    });

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

export default server;
