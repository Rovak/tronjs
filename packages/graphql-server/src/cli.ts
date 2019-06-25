import program from 'commander'
import {server} from "./server";

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const packageJson = require("../package.json");

program
  .version(packageJson.version)
  .option('-p, --port [value]', 'Port')
  .option('-w, --workers [value]', 'Workers')
  .option('-a, --api [value]', 'API (example: -a https://api.trongrid.io)')
  .parse(process.argv);

if (typeof program.workers !== 'undefined') {
  let workers = numCPUs;

  if (program.workers !== true) {
    workers = parseInt(program.workers);
  }


  if (cluster.isMaster) {

    console.log(`Spawning ${workers} workers`);

    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < workers; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  }
}

if (!cluster.isMaster || typeof program.workers === 'undefined') {

  // This `listen` method launches a web-server.  Existing apps
  // can utilize middleware options, which we'll discuss later.
  server.listen(program.port || 8085).then(({ url }) => {
    console.log(`🚀 TRON GraphQL ready at ${url}`);
  });

  console.log(`Worker ${process.pid} started`);

}
