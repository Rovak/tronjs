import HttpApi from "./index";
import {BLOCK_PRODUCE_TIME} from "../../blockchain/constants";
import {GetNowBlockJSON, TransactionJSON} from "./types";
import {defer, interval, Observable, of, pipe, range} from "rxjs";
import {concatAll, concatMap, delay, distinctUntilChanged, filter, map, mergeMap, retryWhen, tap} from "rxjs/operators";
import {addressToHex} from "../../utils/address";
import TransactionInfo from "../../blockchain/transaction/transactionInfo";

export default class HttpApiStreams {
  private httpApi: HttpApi;

  constructor(httpApi: HttpApi) {
    this.httpApi = httpApi;
  }

  getBlockTimer() {
    return interval(BLOCK_PRODUCE_TIME);
  }

  /**
   * Retrieves the current block periodically
   */
  getBlockStream(): Observable<GetNowBlockJSON> {
    return defer(() => this.httpApi.getNowBlock())
      .pipe(
        concatMap((block: any) => {
          let blockNumber = block.block_header.raw_data.number;

          return this.getBlockTimer()
            .pipe(
              concatMap(() => this.httpApi.getNowBlock()),
              distinctUntilChanged(nextBlock => {
                return nextBlock.block_header.raw_data.number;
              }),
              concatMap(nextBlock => {
                const nextBlockNumber = nextBlock.block_header.raw_data.number;
                const diff = nextBlockNumber - blockNumber + 1;
                if (diff > 5) {
                  return defer(() => this.httpApi.getBlockRange(blockNumber + 1, nextBlockNumber))
                          .pipe(concatAll());
                } else if (diff > 1) {
                  return range(blockNumber + 1, nextBlockNumber)
                    .pipe(
                      concatMap(i => this.httpApi.getBlockByNum(i)),
                      retryWhen(errors =>
                        errors.pipe(
                          tap(val => console.error("blockByNum error", val)),
                          delay(1000)
                        )
                      ),
                    );
                } else {
                  // console.log("SINGLE");
                  return of(nextBlock);
                }
              }),
              tap(block => blockNumber = block.block_header.raw_data.number),
              retryWhen(errors =>
                errors.pipe(
                  tap(val => console.error("blockstream error", val)),
                  delay(100)
                )
              ),
            );
        }),
        retryWhen(errors =>
          errors.pipe(
            tap(val => console.error("outer 2 error", val)),
            delay(100)
          )
        ),
      );
  }

  /**
   * Retrieve specifc block
   */
  getBlockNumberStream(blockNumber: number): Observable<GetNowBlockJSON> {
    return defer(() => this.httpApi.getBlockByNum(blockNumber));
  }

  /**
   * Retrieve transactions from the given block
   */
  getTransactionsFromBlock() {
    return mergeMap((block: any) => block.transactions);
  }

  /**
   * Filter the transactions by the given contract type
   */
  filterContractType(type) {
    return filter((tx: any) => tx.raw_data.contract[0].type === type);
  }

  /**
   * Filter the stream by the given contract value
   *
   * @param func
   */
  filterContractValue(func) {
    return filter((tx: any) => func(tx.raw_data.contract[0].parameter.value));
  }

  /**
   * Download transaction info from the given
   */
  getInfoFromTransactions() {
    return pipe(
      concatMap((tx: TransactionJSON) => this.httpApi.findTransactionInfoByHash(tx.txID)),
      filter(x => !!x),
    );
  }

  /**
   * Retrieve events from the transactioninfo contract
   */
  getEventsFromContract() {
    return pipe(
      concatMap((tx: TransactionInfo) => tx.getEventLog().map( ev => ({ ...ev, transaction: tx.id }))),
    )
  }

  /**
   * Reads events from the given contract addresses
   *
   * @param watchedContracts
   */
  readEventsFromContract(watchedContracts: string[]) {

    watchedContracts = watchedContracts.map(addressToHex);

    return  this.getBlockStream()
      .pipe(
        tap((x: any) => console.log("block", x.block_header.raw_data.number)),
        concatMap(block => of(block)
          .pipe(
            this.getTransactionsFromBlock(),
            this.filterContractValue(x => watchedContracts.indexOf(x.contract_address) !== -1),
            this.filterContractType('TriggerSmartContract'),
            this.getInfoFromTransactions(),
            this.getEventsFromContract(),
            map(ev => ({
              ...ev,
              block: block.block_header.raw_data.number,
              timestamp: block.block_header.raw_data.timestamp,
            })),
            retryWhen(errors =>
              errors.pipe(
                tap(val => console.error("outer error", val)),
                delay(500)
              )
            ),
          ))

      )
  }
}
