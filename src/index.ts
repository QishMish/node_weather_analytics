import server from './server';
import './jobs';

const port = 3000;

server.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
