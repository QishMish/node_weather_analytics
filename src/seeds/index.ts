const { v4: uuidv4 } = require('uuid');
import { cassandraClient } from '../config';

export default async function seedData() {
  try {
    const mockData = [
      {
        id: 'd7e0f300-3e43-4f4b-9c50-8e3b1446dafa',
        date: '2023-06-01T09:00:00Z',
        station_id: 'ST00001',
        sensor0: 25.3,
        sensor1: 24.8,
        sensor3: 26.1,
        sensor4: 25.5,
        status: 'valid'
      },
      {
        id: '2f8f748d-6a01-4d7b-bb7e-8c49f413fc70',
        date: '2023-06-01T09:00:00Z',
        station_id: 'ST00001',
        sensor0: 32.7,
        sensor1: 30.2,
        sensor3: 31.4,
        sensor4: 29.9,
        status: 'valid'
      },
      {
        id: '7f74bba9-9a1b-4a2e-b94f-7f01704f7b94',
        date: '2023-06-01T09:00:00Z',
        station_id: 'ST00002',
        sensor0: 12.6,
        sensor1: 11.2,
        sensor3: 10.9,
        sensor4: 13.4,
        status: 'valid'
      },
      {
        id: 'af2a9a0c-95e7-4329-951f-27b942f46ad1',
        date: '2023-06-01T09:00:00Z',
        station_id: 'ST00001',
        sensor0: 17.9,
        sensor1: 18.3,
        sensor3: 15.6,
        sensor4: 16.1,
        status: 'invalid'
      },
      {
        id: '89e731fd-3f15-49a0-a255-012781c21d23',
        date: '2023-06-01T09:00:00Z',
        station_id: 'ST00002',
        sensor0: 27.5,
        sensor1: 28.1,
        sensor3: 25.8,
        sensor4: 26.3,
        status: 'invalid'
      },
      {
        id: '7f74bba9-9a1b-4a2e-b94f-7f01704f7b94',
        date: '2023-06-01T09:00:00Z',
        station_id: 'ST00001',
        sensor0: 22.6,
        sensor1: 23.2,
        sensor3: 21.9,
        sensor4: 24.4,
        status: 'valid'
      }
    ];
    const insertQuery =
      'INSERT INTO temperatures (id, date, station_id, sensor0, sensor1, sensor3, sensor4, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const selectQuery = 'SELECT COUNT(*) FROM temperatures WHERE id = ?';

    const promises = mockData.map(async (data) => {
      const result = await cassandraClient.execute(selectQuery, [data.id]);
      const count = result.rows[0].count;
      if (count === 0) {
        console.log(          parseFloat(data.sensor0.toString()),
        );
      return cassandraClient
        .execute(insertQuery, [
          data.id,
          data.date,
          data.station_id,
          parseFloat(data.sensor0.toString()),
          parseFloat(data.sensor1.toString()),
          parseFloat(data.sensor3.toString()),
          parseFloat(data.sensor4.toString()),
          data.status
        ])
        .catch((e) => console.log(e));
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
