import program from 'commander'
import {server} from "./server";

const packageJson = require("../package.json");

program
  .version(packageJson.version)
  .option('-p, --port [value]', 'Port')
  .option('-a, --api [value]', 'API (example: -a https://api.trongrid.io)')
  .parse(process.argv);

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen(program.port || 8085).then(({ url }) => {
  console.log(`🚀 TRON GraphQL ready at ${url}`);
});
