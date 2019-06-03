import Importer from "./app/importer";
import RedisFactory from "./infrastructure/redis/factory";

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;


(async function() {

  const redis = new RedisFactory().createClient();
  const importer = new Importer(redis);

  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs * 2; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });

    await importer.startMaster();
  } else {
    console.log(`Slave ${process.pid} is running`);
    await importer.startSlave();
  }
})();
