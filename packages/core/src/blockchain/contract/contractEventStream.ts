import xhr from "axios";
import {generate, interval, Observable, of} from "rxjs";
import {concatMap, delay, map, retryWhen, takeWhile, tap} from "rxjs/operators";
import {addressFromHex, addressToHex} from "../../utils/address";
import HttpApi from "../../clients/http";
import ContractAbi from "../../smartcontract/contractAbi";
import {sortBy} from "lodash";
import {ContractEvent, mapEvent} from "./events";
import {BLOCK_PRODUCE_TIME} from "../constants";

/**
 * Produces a stream of events from a contract
 */
export class ContractEventStream {

  private httpApi: HttpApi;
  private contractAddress: string;
  private contractObj: ContractAbi;

  constructor(contractAddress: string, httpApi: HttpApi) {
    this.httpApi = httpApi;
    this.contractAddress = addressToHex(contractAddress);
  }

  private async getContract() {
    if (!this.contractObj) {
      this.contractObj = await this.httpApi.getContractAbi(this.contractAddress);
    }

    return this.contractObj;
  }

  /**
   * Retrieve events
   *
   * @param latestTimestamp
   */
  getEvents(latestTimestamp: number = 0) {
    return generate(1, x => x < 999999, x => x + 1)
      .pipe(
        concatMap(page =>
          of(page)
            .pipe(
              concatMap(async () => {
                const url = `${this.httpApi.getUrl()}/event/contract/${addressFromHex(this.contractAddress)}`;
                return await xhr.get(url, {
                  params: {
                    since: latestTimestamp,
                    sort: 'block_timestamp',
                    size: 100,
                    page,
                  },
                });
              }),
              retryWhen(errors =>
                errors.pipe(
                  tap(val => console.error(val)),
                  delay(1000)
                )
              ),
            )
        ),
        map(x => sortBy(x.data, row => row.block_timestamp)),
        takeWhile(items => items.length > 0),
        concatMap(x => x),
        map(x => mapEvent(x))
      );
  }

  listenToEvents(fromTimestamp: number = 0): Observable<ContractEvent> {

    let latestTimestamp = fromTimestamp;
    return interval(BLOCK_PRODUCE_TIME)
      .pipe(
        concatMap(() => this.getEvents(latestTimestamp)),
        tap(value => {
          latestTimestamp = value.timestamp + 1;
        }),
      )
  }
}
