const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
import program from 'commander'
import {server} from "./server";

const packageJson = require("../package.json");

program
  .version(packageJson.version)
  .option('-p, --port [value]', 'Port')
  .option('-a, --api [value]', 'API (example: -a https://api.trongrid.io)')
  .parse(process.argv);


if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {

  server.listen(program.port || 8085).then(({ url }) => {
    console.log(`Worker ${process.pid}: 🚀 TRON GraphQL ready at ${url}`);
  });
}
