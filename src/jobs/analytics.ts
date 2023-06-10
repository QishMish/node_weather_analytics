import { cassandraClient } from '../config';
import { io } from '../server';

async function getStations() {
  const stationsQuery = 'SELECT station_id FROM temperatures';

  const stationsResult = await cassandraClient.execute(stationsQuery);

  const stationSet = stationsResult.rows.reduce((acc: any, curr: any) => {
    if (!acc.has(curr.station_id)) {
      acc.add(curr.station_id);
      return acc;
    }
    return acc;
  }, new Set<string>([]));
  return stationSet;
}

async function getLast24HourAverage() {
  try {
    const sensors = ['sensor0', 'sensor1', 'sensor2', 'sensor3'];
    const last24HoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).getDate();

    const output: any = {};

    for (const sensor of sensors) {
      const query = `SELECT AVG(${sensor}) AS avg_${sensor} FROM temperatures WHERE ts > ? ALLOW FILTERING`;
      const params = [last24HoursAgo];

      const result = await cassandraClient.execute(query, params, { prepare: true });
      const average = result.rows[0];

      console.log(`Last 24-hour average for ${sensor}:`);
      console.log(average);
      output[sensor] = average;
    }

    return output;
  } catch (error) {
    console.error('Error performing analytics:', error);
  }
}

async function getDailyTemperatureStats(day = 0) {
  try {
    const currentDate = new Date();

    const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - day);

    const startOfDayUTC = new Date(Date.UTC(startOfDay.getFullYear(), startOfDay.getMonth(), startOfDay.getDate()));

    const minTimestamp = startOfDayUTC.getTime();

    const stationSet = await getStations();

    const sensors = ['sensor0', 'sensor1', 'sensor2', 'sensor3'];
    const temperatureStats: any = {};
    const resultByPeriods: any = {};

    for (const station of Array.from<string>(stationSet.values())) {
      temperatureStats[station] = {};

      for (const sensor of sensors) {
        const query = `
          SELECT
            MAX(${sensor}) AS daily_high,
            AVG(${sensor}) AS daily_average,
            MIN(${sensor}) AS daily_minimum
          FROM weather_data.temperatures
          WHERE ts > ?
            AND station_id = ?
          ALLOW FILTERING`;

        const params = [minTimestamp, station];
        const result = await cassandraClient.execute(query, params, { prepare: true });
        const temperatureRecord = result.rows[0];

        temperatureStats[station][sensor] = {
          daily_high: temperatureRecord.daily_high,
          daily_average: temperatureRecord.daily_average,
          daily_minimum: temperatureRecord.daily_minimum
        };
        resultByPeriods[day] = temperatureStats;
      }
    }
    console.log(`Daily temperature stats for each station (Date: ${currentDate}):`);
    console.log(`last ${day === 0 ? '24h' : '7d'}`, resultByPeriods);
    return resultByPeriods;
  } catch (error) {
    console.error('Error performing temperature analysis:', error);
  }
}

async function getStationErrors() {
  try {
    const stationSet = await getStations();
    const stations = Array.from<string>(stationSet);

    const output: any = {};
    for (const station of stations) {
      console.log(station);
      const query = "SELECT COUNT(status) AS error FROM temperatures WHERE station_id = ? AND status = 'inValid' ALLOW FILTERING";
      const params = [station];

      const result = await cassandraClient.execute(query, params, { prepare: true });
      const count = result.rows[0].error;

      output[station] = count.low;
    }

    return output;
  } catch (error) {
    console.error('Error performing analytics:', error);
    throw error;
  }
}

async function getStationDailyErrors() {
  try {
  } catch (error) {
    console.error('Error performing analytics:', error);
    throw error;
  }
}

export const getAnalytics = async () => {
  const [x, y, z, e] = await Promise.all([
    getLast24HourAverage(),
    getDailyTemperatureStats(),
    getDailyTemperatureStats(7),
    getStationErrors()
  ]);

  const data = {
    getLast24HourAverage: x,
    getTemperatureStatsForOneDay: y,
    getTemperatureStatsForSevenDay: z,
    errors: e
  };

  io.emit('data', data);

  cassandraClient
    .execute('SELECT * FROM temperatures', [], { prepare: true })
    .then((result) => {
      const data = result.rows.map((row) => row);
      console.log(data);
      // io.emit('data', data);
    })
    .catch((error) => {
      console.error('Error retrieving data from Cassandra:', error);
    });
};
