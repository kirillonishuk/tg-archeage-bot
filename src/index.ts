import 'module-alias/register';

import { connectToDatabase, closeDatabaseConnection } from './databases';
import { processPlayers } from '@parser/index';
import { scheduleFunction } from '@utils/schedule';

import '@bot';

const start = async () => {
  await connectToDatabase();

  // scheduleFunction(processPlayers)
};

process.on('exit', async () => {
  await closeDatabaseConnection();
});

start();
