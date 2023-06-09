import cron from 'node-cron';
import { getAnalytics } from './analytics';
export * from './analytics';

cron.schedule('*/3 * * * * *', getAnalytics);
