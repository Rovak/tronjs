import xhr from "axios";
import {defer, from, Observable} from "rxjs";
import {concatAll, concatMap, map, mergeMap} from "rxjs/operators";
import {toUtf8} from "../utils";

export default class NetworkScanner {

  /**
   * Start scan from the given http endpoint
   *
   * @param startPoint
   */
  startScan(startPoint: string): Observable<any> {
    return defer(() => xhr.get(`${startPoint}/wallet/listnodes`))
      .pipe(
        concatMap(x => x.data.nodes),
        map((x: any) => toUtf8(x.address.host)),
        mergeMap(async ip => {
          console.log("pinging", ip);
          try {
            return await xhr.get(`http://${ip}:8090/wallet/listnodes`).then(x => x.data.nodes);
          } catch (e) {
            // console.error("not found", ip);
            return [];
          }
        }),
        // tap(x => console.log(x)),
        concatAll(),
        map((x: any) => toUtf8(x.address.host)),
        // tap(console.log),
      );
  }

  /**
   * Ping all given IP addresses by downloading the genesis block
   *
   * @param ips {string[]}
   */
  testSpeed(ips: string[]): Observable<any> {
    return from(ips)
      .pipe(
        mergeMap(async ip => {
          console.log("pinging", ip);
          const start = Date.now();
          try {
            await xhr.get(`http://${ip}:8090/wallet/getblockbynum?num=0`, {
              // timeout: 3000,
            });

            return {
              ip,
              time: Date.now() - start,
            };
          } catch (e) {
            return {
              ip,
              time: 9999999999,
            };
          }
        }),
      );
  }

}
