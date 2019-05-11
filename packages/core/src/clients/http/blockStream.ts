import {concat, defer, interval} from "rxjs";
import {concatAll, distinctUntilChanged, flatMap, map} from "rxjs/operators";
import {sortBy} from "lodash";
import HttpApi from "./index";

export class BlockStream {

  /**
   * Default: http://api.trongrid.io
   */
  private httpClient: HttpApi;

  constructor(httpClient: HttpApi) {
    this.httpClient = httpClient;
  }

  async readRange(start: number, endBlock: number) {

    const currentBlockNumber = endBlock;
    const chunkSize = 100;
    const blockId = start;

    const ranges = [];
    for (let i = blockId; i < currentBlockNumber; i += chunkSize + 1) {
      let end = i + chunkSize;
      end = end > currentBlockNumber ? currentBlockNumber : end;

      ranges.push(
        defer(() => this.httpClient.getBlockRange(i, end))
        .pipe(
          map(blocks => sortBy(blocks, block => block.block_header.raw_data.number)),
          concatAll()
        )
      );
    }

    return concat(...ranges);
  }

  watch() {
    return interval(2600)
      .pipe(
        flatMap(() => this.httpClient.getNowBlock()),
        distinctUntilChanged((b1, b2) => b1.block_header.raw_data.number === b2.block_header.raw_data.number)
      );
  }
}
