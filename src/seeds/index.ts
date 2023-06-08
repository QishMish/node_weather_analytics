const { v4: uuidv4 } = require('uuid');
import { cassandraClient } from '../config';

export default async function seedData() {
  try {
    const mockData = [
      { id: uuidv4(), date: new Date('2023-06-01T09:00:00Z'), stationName: 'Station 1', temperature: 25.5 },
      { id: uuidv4(), date: new Date('2023-06-01T10:00:00Z'), stationName: 'Station 2', temperature: 26.2 },
      { id: uuidv4(), date: new Date('2023-06-01T11:00:00Z'), stationName: 'Station 3', temperature: 24.8 }
    ];
    const insertQuery = 'INSERT INTO temperature_data (id, date, stationName, temperature) VALUES (?, ?, ?, ?)';
    const selectQuery = 'SELECT COUNT(*) FROM temperature_data WHERE id = ?';

    const promises = mockData.map(async (data) => {
      const result = await cassandraClient.execute(selectQuery, [data.id]);
      const count = result.rows[0].count;

      if (count === 0) {
        return cassandraClient.execute(insertQuery, [data.id, data.date, data.stationName, data.temperature]);
      }

      return Promise.resolve();
    });

    await Promise.all(promises);
    console.log('Data seeding completed successfully.');
    console.log('Data seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}
