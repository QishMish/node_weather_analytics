import { Client } from 'cassandra-driver';

export const cassandraClient = new Client({
  contactPoints: ['cassandra'],
  localDataCenter: 'datacenter1',
  keyspace: 'weather_data'
});
