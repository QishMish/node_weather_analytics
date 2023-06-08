import server from './server';
import './jobs';
import seedData from './seeds';

const port = 3000;

server.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
  seedData().catch((e) => console.log('error while seedng data', e));
});
