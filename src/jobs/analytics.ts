import { cassandraClient } from '../config';
import { io } from '../server';

export const getAnalytics = () => {
  console.log('job');
  cassandraClient
    .execute('SELECT * FROM temperature_data', [], { prepare: true })
    .then((result) => {
      const data = result.rows.map((row) => row );

      console.log('data::::::::', data.length);
      io.emit('data', data);
    })
    .catch((error) => {
      console.error('Error retrieving data from Cassandra:', error);
    });
};
